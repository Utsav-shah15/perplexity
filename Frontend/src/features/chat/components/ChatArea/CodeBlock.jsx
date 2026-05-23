export default function CodeBlock() {
  return (
    <div className="bg-black rounded-2xl overflow-hidden border border-zinc-800">

      <div className="bg-zinc-800 px-5 py-3 text-zinc-300">
        python
      </div>

      <pre className="p-6 text-green-400 overflow-x-auto">
{`import qiskit

from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)
qc.cx(0,1)

qc.measure_all()
`}
      </pre>
    </div>
  );
}