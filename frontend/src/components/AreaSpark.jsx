export default function AreaSpark({ values = [], color = "#ff488b", height = 56 }) {
  if (!values.length) {
    return <div style={{ height }} />;
  }
  const w = 180;
  const h = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${line} L ${pts.at(-1)[0]} ${h} L ${pts[0][0]} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
      <path d={area} fill={color} opacity="0.16" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
