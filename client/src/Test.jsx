export default function Test() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'green' }}>✅ REACT FONCTIONNE !</h1>
      <p>Si vous voyez ce message, React est bien actif.</p>
      <button onClick={() => alert('Ça marche !')}>Cliquez ici</button>
    </div>
  );
}