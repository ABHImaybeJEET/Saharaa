// client/src/components/MeshRelayModal.jsx
import React, { useState, useEffect } from "react";
import { 
  X, 
  Network, 
  Radio, 
  Smartphone, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Activity, 
  ShieldCheck, 
  WifiOff, 
  Server,
  Sparkles
} from "lucide-react";
import { soundEngine } from "../utils/soundEffects";

export default function MeshRelayModal({ isOpen, onClose }) {
  const [activeHop, setActiveHop] = useState(0);
  const [packetLog, setPacketLog] = useState([
    { id: 1, text: "PING [Node-104 Bandra] -> Signal RSSI -72dBm", time: "14:32:01" },
    { id: 2, text: "ROUTED [Repeater-02 BKC] -> Packet CRC Valid", time: "14:32:02" },
    { id: 3, text: "RECEIVED [HQ Gateway] -> Dispatched to Haversine Mesh", time: "14:32:03" }
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveHop(prev => (prev + 1) % 4);
    }, 1400);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const NODES = [
    {
      id: "node-1",
      name: "Offline Citizen (Feature Phone)",
      type: "Origin Device",
      icon: Smartphone,
      status: "Cell Towers 0%",
      detail: "GSM SMS / LoRa 868MHz packet queued",
      color: "text-purple-700 dark:text-purple-300 border-purple-400 dark:border-purple-700"
    },
    {
      id: "node-2",
      name: "LoRa Field Relay 104 (Bandra)",
      type: "Battery Repeater",
      icon: Radio,
      status: "Solar 94% / RSSI -74dBm",
      detail: "Range: 4.8 km LoRa P2P packet forward",
      color: "text-cyan-700 dark:text-cyan-300 border-cyan-400 dark:border-cyan-700"
    },
    {
      id: "node-3",
      name: "BKC Tactical Tower Node",
      type: "Mesh Backbone",
      icon: Cpu,
      status: "Packet Hop 2 of 3",
      detail: "Low-power multi-hop mesh bridge",
      color: "text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-700"
    },
    {
      id: "node-4",
      name: "Saharaa Command Hub",
      type: "Central Dispatch Mesh",
      icon: Server,
      status: "Instant Haversine Dispatch",
      detail: "Decodes SMS, finds closest boat, alerts crew",
      color: "text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700"
    }
  ];

  const handleSimulatePacket = () => {
    soundEngine.playRadarPing();
    setActiveHop(0);
    const newLog = {
      id: Date.now(),
      text: `PACKET #${Math.floor(1000 + Math.random() * 9000)}: "FLOOD 400050 CRITICAL" -> Hop 0->1->2->3 OK`,
      time: new Date().toLocaleTimeString()
    };
    setPacketLog(prev => [newLog, ...prev.slice(0, 5)]);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-theme-card text-theme-primary border border-theme-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-theme-border bg-theme-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-600/30">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-theme-primary uppercase tracking-wider font-mono">
                LoRaWAN & Offline Mesh Packet Topology
              </h2>
              <p className="text-xs text-theme-muted">
                Zero-Internet disaster survivability via multi-hop radio packet forwarding
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Topology Explainer Card */}
          <div className="bg-theme-subtle border border-purple-400 dark:border-purple-800 p-3.5 rounded-xl text-xs space-y-1">
            <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 font-mono">
              <WifiOff className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>CYCLONE BLACKOUT SURVIVABILITY PROTOCOL</span>
            </div>
            <p className="text-theme-secondary text-xs leading-relaxed font-sans">
              When telecom fiber cuts and cell towers go down, Saharaa uses multi-hop LoRa radio nodes & GSM SMS fallback to bridge disconnected citizens directly to the emergency dispatch mesh without needing WiFi or mobile data.
            </p>
          </div>

          {/* Interactive Visual Node Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            {NODES.map((node, idx) => {
              const Icon = node.icon;
              const isCurrentHop = activeHop === idx;

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative bg-theme-subtle ${
                    isCurrentHop 
                      ? "ring-2 ring-purple-500 scale-[1.02] shadow-md " + node.color
                      : "border-theme-border text-theme-muted"
                  }`}
                >
                  {isCurrentHop && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center text-[9px] text-white animate-ping"></div>
                  )}

                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-theme-border">
                      <span className="text-[10px] font-mono uppercase font-bold text-theme-muted">
                        Hop {idx + 1}
                      </span>
                      <Icon className={`w-4 h-4 ${isCurrentHop ? "text-purple-600 dark:text-purple-400" : "text-theme-muted"}`} />
                    </div>

                    <div className="mt-2 text-xs font-bold text-theme-primary">
                      {node.name}
                    </div>

                    <div className="text-[10px] text-theme-muted font-mono mt-0.5">
                      {node.type}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-theme-border space-y-1">
                    <div className="text-[10px] text-purple-700 dark:text-purple-300 font-mono font-semibold">
                      {node.status}
                    </div>
                    <div className="text-xs text-theme-secondary leading-tight font-sans">
                      {node.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trigger Simulation Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleSimulatePacket}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Live Packet Transmission</span>
            </button>

            <span className="text-xs text-theme-muted font-mono">
              Packet Success Rate: <strong className="text-emerald-600 dark:text-emerald-400">99.4%</strong> | Latency: <strong className="text-cyan-600 dark:text-cyan-400">1.2s</strong>
            </span>
          </div>

          {/* Live Packet Telemetry Terminal */}
          <div className="p-3 bg-theme-subtle border border-theme-border rounded-xl font-mono text-xs space-y-1">
            <div className="text-theme-muted uppercase text-[10px] font-bold pb-1 border-b border-theme-border">
              Live Mesh Packet Logs
            </div>
            {packetLog.map(p => (
              <div key={p.id} className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <span className="text-theme-muted">[{p.time}]</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
