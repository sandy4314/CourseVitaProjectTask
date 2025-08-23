// pages/_app.js
import '../src/app/globals.css'; // ✅ correct path if your CSS is in styles/globals.css

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
