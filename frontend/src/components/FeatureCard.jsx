export default function FeatureCard({ icon, title, body, light = false }) {
  if (light) {
    return (
      <div className="card-light card-hover p-6 text-left">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#ff488b]/10 text-[#ff488b]">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-[#172b76]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#586490]">{body}</p>
      </div>
    );
  }
  return (
    <div className="card card-hover p-6 text-left">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-[#1c243c] text-[#ff488b]">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#b3c0d4]">{body}</p>
    </div>
  );
}
