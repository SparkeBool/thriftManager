// client/src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="auth-footer">
      <p className="footer-text">
        &copy; {new Date().getFullYear()} Sparke Information Technology. All rights reserved. |{' '}
        <a href="/privacy" className="footer-link">Privacy Policy</a> |{' '}
        <a href="/terms" className="footer-link">Terms of Service</a>
      </p>
    </footer>
  );
};

export default Footer;
