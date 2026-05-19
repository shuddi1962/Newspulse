export function NewsletterWidget() {
  return (
    <div className="bg-[#0f1419] p-5 text-center">
      <h3 className="mb-[6px] font-display text-[16px] font-bold text-white">
        Stay Informed
      </h3>
      <p className="mb-[14px] text-[12px] leading-[1.5] text-gray-400">
        Get the top stories delivered to your inbox every morning. No spam, unsubscribe anytime.
      </p>
      <input
        type="email"
        placeholder="Your email address"
        className="mb-2 w-full border-none bg-white px-3 py-[9px] text-[12px] outline-none"
      />
      <button className="w-full bg-[#e63946] py-[9px] text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f]">
        Subscribe Free
      </button>
    </div>
  );
}
