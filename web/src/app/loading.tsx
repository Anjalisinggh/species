export default function Loading() {
  return (
    <div className="wrap" aria-busy="true">
      <span className="sr" role="status">Loading</span>
      <div className="pagehead"><div className="skeleton line" style={{ width: 280, height: 40 }} /><div className="skeleton line" style={{ width: 420, maxWidth: '100%' }} /></div>
      <div className="grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton cardsk" />)}</div>
    </div>
  );
}
