import SwiftUI
import WebKit

@MainActor
final class GameSession: NSObject, ObservableObject, WKNavigationDelegate {
    @Published var failure: String?
    @Published var loading = true
    let webView: WKWebView

    override init() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        webView = WKWebView(frame: .zero, configuration: configuration)
        super.init()
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.047, green: 0.102, blue: 0.114, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.bounces = false
        webView.scrollView.isScrollEnabled = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = false
        loadGame()
    }

    func loadGame() {
        failure = nil
        loading = true
        webView.stopLoading()
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") else {
            loading = false
            failure = "游戏资源缺失，请重新安装。"
            return
        }
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    func suspend() {
        webView.evaluateJavaScript("""
        (() => {
            window.NaiwaV2?.pause?.();
            document.querySelectorAll('audio,video').forEach(el => el.pause());
        })();
        """, completionHandler: nil)
        webView.setAllMediaPlaybackSuspended(true, completionHandler: nil)
    }

    func activate() {
        webView.setAllMediaPlaybackSuspended(false, completionHandler: nil)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loading = false
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        report(error)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        report(error)
    }

    private func report(_ error: Error) {
        guard (error as NSError).code != NSURLErrorCancelled else { return }
        loading = false
        failure = "游戏加载失败，请重试。"
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        loading = false
        failure = "游戏画面已中断，请重新加载。"
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        if url.isFileURL {
            decisionHandler(.allow)
            return
        }
        decisionHandler(.cancel)
        if navigationAction.navigationType == .linkActivated,
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
            Color(red: 0.047, green: 0.102, blue: 0.114).ignoresSafeArea()
            GameWebView(session: session).ignoresSafeArea()
            if session.loading || session.failure != nil {
                VStack(spacing: 18) {
                    Text("奶娃快跑").font(.largeTitle.bold())
                    Text(session.failure ?? "场景加载中…")
                        .multilineTextAlignment(.center)
                    if session.loading { ProgressView() }
                    if session.failure != nil {
                        Button("重新加载", action: session.loadGame)
                            .buttonStyle(.borderedProminent)
                            .tint(.yellow)
                    }
                }
                .padding(30)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 24))
                .padding(24)
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
