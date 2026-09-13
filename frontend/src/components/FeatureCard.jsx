export default function FeatureCard({ icon, title, body }) {
  return (
    <div className="card card-hover p-6 text-left">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-[#17171c] text-[#4f8cff]">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#a1a1aa]">{body}</p>
    </div>
  );
}
