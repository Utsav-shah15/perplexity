import CodeBlock from "./CodeBlock";

export default function ChatMessage() {
  return (
    <div className="space-y-6">

      <div className="flex justify-end">
        <div className="bg-zinc-800/80 max-w-2xl px-5 py-3 rounded-2xl rounded-tr-sm text-zinc-100 text-[15px]">
          Can you explain the basics of Quantum Computing?
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-lg bg-[#c0a6f5] flex-shrink-0" />

        <div className="max-w-3xl">
          <h2 className="text-white text-base font-semibold mb-2">
            Aura AI
          </h2>

          <p className="text-zinc-300 text-[15px] leading-relaxed mb-4">
            Quantum computing leverages principles of quantum mechanics.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
              <h3 className="text-violet-300 text-sm font-semibold mb-1">
                Superposition
              </h3>

              <p className="text-zinc-400 text-sm">
                Qubits can exist in multiple states simultaneously.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
              <h3 className="text-orange-300 text-sm font-semibold mb-1">
                Entanglement
              </h3>

              <p className="text-zinc-400 text-sm">
                Qubits become linked regardless of distance.
              </p>
            </div>
          </div>

          <CodeBlock />
        </div>
      </div>
    </div>
  );
}