import SwiftUI
import WebKit

private final class ProfileBridge: NSObject, WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "profile", message.frameInfo.isMainFrame,
              message.frameInfo.request.url?.isFileURL == true,
              let json = message.body as? String, json.utf8.count < 16000,
              let data = json.data(using: .utf8),
              (try? JSONSerialization.jsonObject(with: data)) is [String: Any] else { return }
        UserDefaults.standard.set(json, forKey: "sprout-profile-v1")
    }
}

@MainActor
final class GameSession: NSObject, ObservableObject, WKNavigationDelegate {
    static let referenceURL = URL(string: "https://naiwa-kuaipao.pages.dev/?v=6.3.3")!
    @Published var failure: String?
    @Published var loading = true
    @Published var offline = false
    let webView: WKWebView

    override init() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.userContentController.add(ProfileBridge(), name: "profile")
        webView = WKWebView(frame: .zero, configuration: configuration)
        super.init()
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.46, green: 0.82, blue: 0.85, alpha: 1)
        webView.scrollView.bounces = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        loadReference()
    }

    func loadReference() {
        offline = false
        failure = nil
        loading = true
        webView.stopLoading()
        let controller = webView.configuration.userContentController
        controller.removeAllUserScripts()
        controller.addUserScript(WKUserScript(source: """
        (() => {
            document.title = document.title.replaceAll('奶蛙快跑', '奶娃快跑');
            const logo = document.querySelector('.logo-green');
            if (logo) logo.textContent = '奶娃';
            const heading = document.querySelector('h1[data-text]');
            if (heading) heading.dataset.text = '奶娃快跑';
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                if (['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName)) continue;
                if (node.textContent.includes('奶蛙快跑')) {
                    node.textContent = node.textContent.replaceAll('奶蛙快跑', '奶娃快跑');
                }
            }
        })();
        """, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        webView.load(URLRequest(url: Self.referenceURL, timeoutInterval: 45))
    }

    func loadOffline() {
        offline = true
        failure = nil
        loading = true
        webView.stopLoading()
        let saved = UserDefaults.standard.string(forKey: "sprout-profile-v1") ?? "null"
        let encoded = Data(saved.utf8).base64EncodedString()
        let controller = webView.configuration.userContentController
        controller.removeAllUserScripts()
        controller.addUserScript(WKUserScript(
            source: "window.__nativeProfile = JSON.parse(atob('\(encoded)'));",
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") else {
            loading = false
            failure = "离线资源缺失，请重新安装。"
            return
        }
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    func retry() { if offline { loadOffline() } else { loadReference() } }

    func suspend() {
        webView.evaluateJavaScript("""
        (() => {
            window.SproutApp?.pause();
            if (document.getElementById('app')?.dataset.view === 'running') {
                document.getElementById('pause')?.click();
            }
            document.querySelectorAll('audio,video').forEach(el => el.pause());
        })();
        """, completionHandler: nil)
        webView.setAllMediaPlaybackSuspended(true, completionHandler: nil)
    }
    func activate() { webView.setAllMediaPlaybackSuspended(false, completionHandler: nil) }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { loading = false }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { report(error) }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { report(error) }
    private func report(_ error: Error) {
        guard (error as NSError).code != NSURLErrorCancelled else { return }
        loading = false
        failure = offline ? "游戏加载失败，请重试。" : "暂时无法连接原版游戏。可以重试，或进入离线练习。"
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        loading = false
        failure = "游戏画面已中断，请重新加载。未结算的本局进度可能丢失。"
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if offline && url.isFileURL { decisionHandler(.allow); return }
        if !offline && url.scheme == "https" && url.host == Self.referenceURL.host {
            if navigationAction.targetFrame == nil {
                decisionHandler(.cancel)
                webView.load(navigationAction.request)
            } else { decisionHandler(.allow) }
            return
        }
        decisionHandler(.cancel)
        if !offline && navigationAction.navigationType == .linkActivated,
           ["https", "mailto", "tel"].contains(url.scheme ?? "") {
            UIApplication.shared.open(url)
        }
    }
}
private struct GameWebView: UIViewRepresentable {
    let session: GameSession
    func makeUIView(context: Context) -> WKWebView { session.webView }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
struct GameScreen: View {
    @StateObject private var session = GameSession()
    @Environment(\.scenePhase) private var scenePhase
    var body: some View {
        ZStack {
            Color.teal.ignoresSafeArea()
            GameWebView(session: session).ignoresSafeArea()
            if session.loading || session.failure != nil {
                VStack(spacing: 20) {
                    Text("奶娃快跑").font(.largeTitle.bold())
                    Text(session.failure ?? (session.offline ? "正在准备离线跑道…" : "正在连接原版游戏…"))
                        .multilineTextAlignment(.center)
                    if session.loading { ProgressView() }
                    if session.failure != nil {
                        Button("重新加载", action: session.retry).buttonStyle(.borderedProminent).tint(.teal)
                    }
                    if !session.offline {
                        Button("离线练习（部分玩法）", action: session.loadOffline).buttonStyle(.bordered)
                    } else if session.failure != nil {
                        Button("返回原版", action: session.loadReference).buttonStyle(.bordered)
                    }
                }
                .padding(32).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 28)).padding(24)
            }
        }
        .statusBarHidden()
        .onChange(of: scenePhase) { phase in
            UIApplication.shared.isIdleTimerDisabled = phase == .active
            if phase == .active { session.activate() } else { session.suspend() }
        }
        .onAppear { UIApplication.shared.isIdleTimerDisabled = true }
        .onDisappear { UIApplication.shared.isIdleTimerDisabled = false }
    }
}
