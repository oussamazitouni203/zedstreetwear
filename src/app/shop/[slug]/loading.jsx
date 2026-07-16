export default function ProductLoading() {
  return (
    <main className="page-shell">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          {/* image */}
          <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%', borderRadius: 2 }} />
          {/* info */}
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="skel-line" style={{ width: '60%', height: 14 }} />
            <div className="skel-line" style={{ width: '85%', height: 32 }} />
            <div className="skel-line" style={{ width: '30%', height: 22 }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {[1,2,3,4].map(i => (
                <div key={i} className="skeleton" style={{ width: 52, height: 44, borderRadius: 2 }} />
              ))}
            </div>
            <div className="skeleton" style={{ height: 52, borderRadius: 2, marginTop: 8 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <div className="skel-line" style={{ width: '100%', height: 12 }} />
              <div className="skel-line" style={{ width: '90%', height: 12 }} />
              <div className="skel-line" style={{ width: '75%', height: 12 }} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
