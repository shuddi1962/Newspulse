export function NewsletterWidget() {
  return (
    <div className="bg-[#0f1419] p-6 text-center">
      <h3 className="mb-2 font-display text-lg font-bold text-white">
        Stay Informed
      </h3>
      <p className="mb-4 text-sm leading-[1.5] text-gray-400">
        Get the top stories delivered to your inbox every morning. No spam, unsubscribe anytime.
      </p>
      <input
        type="email"
        placeholder="Your email address"
        className="mb-2.5 w-full border-none bg-white px-4 py-2.5 text-sm outline-none"
      />
      <button className="w-full bg-[#e63946] py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f]">
        Subscribe Free
      </button>
    </div>
  );
}
