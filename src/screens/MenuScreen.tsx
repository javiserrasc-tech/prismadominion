interface MenuScreenProps {
  onStart: () => void
}

export function MenuScreen({ onStart }: MenuScreenProps) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(155,89,182,0.15) 0%, transparent 70%)',
      padding: 24,
    }}>
      {/* Title */}
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 'clamp(28px, 6vw, 56px)',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f5a623, #e84040, #9b59b6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1.1,
        marginBottom: 8,
      }}>
        PRISMA<br />DOMINION
      </div>

      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 'clamp(10px, 2vw, 14px)',
        color: 'var(--text-muted)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        marginBottom: 48,
      }}>
        Chronicle of the Five Goddesses
      </div>

      {/* Faction icons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
        {[
          { color: '#f5a623', icon: '✦', name: 'Solara' },
          { color: '#4a90d9', icon: '❄', name: 'Glacis' },
          { color: '#e84040', icon: '◆', name: 'Ignis' },
          { color: '#27ae60', icon: '✿', name: 'Verdis' },
          { color: '#9b59b6', icon: '◈', name: 'Aether' },
        ].map(f => (
          <div key={f.name} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `1.5px solid ${f.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: f.color,
              boxShadow: `0 0 12px ${f.color}44`,
            }}>
              {f.icon}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              {f.name}
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={onStart}
        style={{ padding: '14px 40px', fontSize: 15, letterSpacing: '0.15em' }}
      >
        ⚔  ENTER BATTLE
      </button>

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
        A card battle game inspired by classic TCGs<br />
        Built with React · Deployable on Vercel
      </div>
    </div>
  )
}
