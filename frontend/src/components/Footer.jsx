export default function Footer() {
  return (
    <footer className="bg-white border-top py-3 mt-auto text-muted small">
      <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div>&copy; {new Date().getFullYear()} CodeArena. All rights reserved.</div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary">LeetCode-style Online Judge</span>
          <span>&bull;</span>
          <span className="text-secondary">JavaScript &bull; Java</span>
        </div>
      </div>
    </footer>
  );
}
