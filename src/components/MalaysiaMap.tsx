import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";

const GEO_URL = "/malaysia-states.json";

const STATE_NAMES: Record<string, string> = {
  Sabah: "Sabah",
  Sarawak: "Sarawak",
  Johor: "Johor",
  Kedah: "Kedah",
  Kelantan: "Kelantan",
  Melaka: "Melaka",
  "Negeri Sembilan": "Negeri Sembilan",
  Pahang: "Pahang",
  Perak: "Perak",
  Perlis: "Perlis",
  "Pulau Pinang": "Penang",
  Selangor: "Selangor",
  Terengganu: "Terengganu",
  "Kuala Lumpur": "Kuala Lumpur",
  Putrajaya: "Putrajaya",
  Labuan: "Labuan",
};

function Tooltip({ name, x, y }: { name: string; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-30"
      style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}
    >
      <div className="px-[14px] py-[7px] rounded-[8px] bg-[var(--surface-elevated)] border border-[var(--primary-25)] shadow-[0_8px_32px_rgba(85,34,224,0.25)]">
        <span className="font-inter text-[12px] font-semibold text-[var(--text-primary)] whitespace-nowrap">
          {name}
        </span>
      </div>
    </motion.div>
  );
}

const MalaysiaMap = memo(function MalaysiaMap() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  function handleMouseMove(
    e: React.MouseEvent<SVGPathElement>,
    name: string
  ) {
    const container = e.currentTarget.closest(".malaysia-map-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 16,
    });
    setHoveredState(name);
  }

  return (
    <div className="malaysia-map-container relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {hoveredState && (
          <Tooltip
            key={hoveredState}
            name={STATE_NAMES[hoveredState] ?? hoveredState}
            x={tooltipPos.x}
            y={tooltipPos.y}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-[600px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [109.5, 4],
            scale: 1800,
          }}
          width={600}
          height={500}
          style={{ width: "100%", height: "auto", background: "transparent" }}
        >
          {/* SVG filter for glow on hover */}
          <defs>
            <filter id="state-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#bcb3ff" floodOpacity="0.6" />
            </filter>
          </defs>

          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const name = geo.properties.name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseMove={(e: any) =>
                      handleMouseMove(
                        e as unknown as React.MouseEvent<SVGPathElement>,
                        name
                      )
                    }
                    onMouseLeave={() => setHoveredState(null)}
                    style={{
                      default: {
                        fill: "#1e1e24",
                        stroke: "#2a2a32",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 0.2s ease-out",
                        cursor: "pointer",
                      },
                      hover: {
                        fill: "#5522e0",
                        stroke: "#bcb3ff",
                        strokeWidth: 1,
                        outline: "none",
                        filter: "url(#state-glow)",
                        transform: "translateY(-3px)",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#5522e0",
                        stroke: "#bcb3ff",
                        strokeWidth: 1,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
});

export default MalaysiaMap;
