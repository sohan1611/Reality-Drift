export default function Messages() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <h2 className="text-3xl font-bold tracking-tight glow-text">Comms Channel</h2>
      
      <div className="flex-1 glass-panel rounded-2xl glow-border flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-300">No active transmissions</h3>
          <p className="text-gray-500 mt-2">Connect with others to start collaborating.</p>
        </div>
      </div>
    </div>
  );
}
