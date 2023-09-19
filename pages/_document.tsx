import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
      <Html>
        <Head>
          <script defer src="/assets/js/jquery.min.js"></script>
          <script defer src="/assets/js/browser.min.js"></script>
          <script defer src="/assets/js/breakpoints.min.js"></script>
          <script defer src="/assets/js/util.js"></script>
          <script defer src="/assets/js/main.js"></script>
        </Head>
        <body className="is-preload">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
