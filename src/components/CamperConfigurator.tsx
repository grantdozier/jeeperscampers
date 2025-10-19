import React from 'react';

interface CamperConfig {
  frame: string;
  wheels: string;
  sidePanels: boolean;
  frontPanel: boolean;
  rearPanel: boolean;
  diamondPlate: boolean;
  roofPlatform: boolean;
  roofRack: boolean;
  roofTent: boolean;
  roofLadder: boolean;
  rearKitchen: boolean;
  propaneTank: boolean;
  kitchenCounter: boolean;
  sideAccessDoors: boolean;
  storageBoxes: boolean;
  jerryCanMounts: boolean;
  toolBox: boolean;
  fenders: boolean;
  runningBoards: boolean;
  lightingKit: boolean;
  solarPanel: boolean;
  batterySystem: boolean;
  waterTank: boolean;
}

interface CamperConfiguratorProps {
  config: CamperConfig;
}

const CamperConfigurator: React.FC<CamperConfiguratorProps> = ({ config }) => {
  // Frame dimensions based on selection
  const getFrameSize = () => {
    switch (config.frame) {
      case 'minimalist':
        return { width: 81, length: 144, height: 50 }; // 6'9" × 12' × ~4'2"
      case 'standard':
        return { width: 81, length: 144, height: 55 }; // 6'9" × 12' × ~4'7"
      case 'heavy':
        return { width: 81, length: 144, height: 60 }; // 6'9" × 12' × 5'
      default:
        return { width: 81, length: 144, height: 55 };
    }
  };

  const frameSize = getFrameSize();
  const viewBoxWidth = 800;
  const viewBoxHeight = 600;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;

  // Color palette
  const COLORS = {
    body: '#1a1a1a',
    panel: '#2a2a2a', 
    accent: '#f97316',
    shadow: 'rgba(0,0,0,0.3)',
    steel: '#4a5568',
    diamond: '#9ca3af',
    tire: '#111111',
    rim: '#e5e7eb',
    propane: '#ffffff'
  };

  // Isometric projection
  const iso = (x: number, y: number, z: number) => {
    const scale = 2.5; // Much bigger scale
    const isoX = centerX + (x - y) * 0.866 * scale;
    const isoY = centerY + (x + y) * 0.5 * scale - z * scale;
    return { x: isoX, y: isoY };
  };

  // Wheel specifications
  const getWheelSpecs = () => {
    switch (config.wheels) {
      case 'standard':
        return { radius: 25, treadDepth: 4, rimSize: 18, color: '#333' }; // 31" diameter, scaled up
      case 'offroad':
        return { radius: 25, treadDepth: 6, rimSize: 18, color: '#222' }; // 31" diameter, scaled up
      case 'extreme':
        return { radius: 25, treadDepth: 8, rimSize: 18, color: '#111' }; // 31" diameter, scaled up
      default:
        return { radius: 25, treadDepth: 4, rimSize: 18, color: '#333' };
    }
  };

  const wheelSpecs = getWheelSpecs();

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full" style={{ maxHeight: '700px' }}>
      {/* Ground shadow */}
      <ellipse
        cx={centerX}
        cy={centerY + 180}
        rx={frameSize.length * 1.1}
        ry={frameSize.width * 0.4}
        fill={COLORS.shadow}
      />

      {/* Hitch tongue pointing LEFT */}
      <g>
        {(() => {
          const tongueEnd = iso(-frameSize.length / 2 - 45, 0, 0);
          const tongueLeft = iso(-frameSize.length / 2, -15, 0);
          const tongueRight = iso(-frameSize.length / 2, 15, 0);
          return (
            <>
              <polygon
                points={`${tongueLeft.x},${tongueLeft.y} ${tongueRight.x},${tongueRight.y} ${tongueEnd.x},${tongueEnd.y}`}
                fill={COLORS.steel}
                stroke="#000"
                strokeWidth="2"
              />
              <circle cx={tongueEnd.x - 8} cy={tongueEnd.y} r="5" fill="#666" stroke="#000" strokeWidth="1" />
            </>
          );
        })()}
      </g>

      {/* Main trailer body/frame */}
      <g>
        {/* Base platform */}
        <path
          d={`
            M ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).y}
            L ${iso(frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, -frameSize.width / 2, 0).y}
            L ${iso(frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, frameSize.width / 2, 0).y}
            L ${iso(-frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, frameSize.width / 2, 0).y}
            Z
          `}
          fill={config.diamondPlate ? COLORS.diamond : COLORS.body}
          stroke="#000"
          strokeWidth="2"
        />

        {/* Diamond plate pattern */}
        {config.diamondPlate && (
          <g opacity="0.4">
            {Array.from({ length: 15 }).map((_, i) => (
              <line
                key={`dp-${i}`}
                x1={iso(-frameSize.length / 2 + i * (frameSize.length / 14), -frameSize.width / 2, 0).x}
                y1={iso(-frameSize.length / 2 + i * (frameSize.length / 14), -frameSize.width / 2, 0).y}
                x2={iso(-frameSize.length / 2 + i * (frameSize.length / 14), frameSize.width / 2, 0).x}
                y2={iso(-frameSize.length / 2 + i * (frameSize.length / 14), frameSize.width / 2, 0).y}
                stroke="#666"
                strokeWidth="0.5"
              />
            ))}
          </g>
        )}
      </g>

      {/* Side panels */}
      {config.sidePanels && (
        <>
          {/* Left long side panel */}
          <path
            d={`
              M ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).y}
              L ${iso(frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, -frameSize.width / 2, 0).y}
              L ${iso(frameSize.length / 2, -frameSize.width / 2, frameSize.height).x} ${iso(frameSize.length / 2, -frameSize.width / 2, frameSize.height).y}
              L ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).y}
              Z
            `}
            fill={COLORS.panel}
            stroke={COLORS.accent}
            strokeWidth="2"
            opacity="0.95"
          />
          
          {/* Right long side panel */}
          <path
            d={`
              M ${iso(-frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, frameSize.width / 2, 0).y}
              L ${iso(frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, frameSize.width / 2, 0).y}
              L ${iso(frameSize.length / 2, frameSize.width / 2, frameSize.height).x} ${iso(frameSize.length / 2, frameSize.width / 2, frameSize.height).y}
              L ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).y}
              Z
            `}
            fill={COLORS.panel}
            stroke={COLORS.accent}
            strokeWidth="2"
            opacity="0.85"
          />

          {/* Side door on RIGHT long side */}
          {config.sideAccessDoors && (
            <g>
              {(() => {
                // Door positioned on right side panel, scaled up larger
                const doorX = -frameSize.length / 4; // Position on right side of trailer
                const doorCenter = iso(doorX, frameSize.width / 2, frameSize.height / 2); // On right long side panel
                const doorWidth = 60;  // Much larger door width
                const doorHeight = 72; // Much larger door height
                return (
                  <>
                    {/* Door frame */}
                    <rect
                      x={doorCenter.x - doorWidth/2}
                      y={doorCenter.y - doorHeight/2}
                      width={doorWidth}
                      height={doorHeight}
                      rx="8"
                      fill="#1a1a1a"
                      stroke="#000"
                      strokeWidth="2"
                    />
                    {/* Door panel */}
                    <rect
                      x={doorCenter.x - doorWidth/2 + 2}
                      y={doorCenter.y - doorHeight/2 + 2}
                      width={doorWidth - 4}
                      height={doorHeight - 4}
                      rx="6"
                      fill={COLORS.panel}
                      stroke="#333"
                      strokeWidth="1"
                    />
                    {/* Window */}
                    <rect
                      x={doorCenter.x - 20}
                      y={doorCenter.y - 24}
                      width="40"
                      height="32"
                      rx="8"
                      fill="#4a90e2"
                      opacity="0.3"
                      stroke="#333"
                      strokeWidth="1"
                    />
                    {/* Handle */}
                    <circle cx={doorCenter.x + 20} cy={doorCenter.y + 16} r="4" fill="#999" />
                  </>
                );
              })()}
            </g>
          )}
        </>
      )}

      {/* Front panel (LEFT end) */}
      {config.frontPanel && (
        <path
          d={`
            M ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).y}
            L ${iso(-frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, frameSize.width / 2, 0).y}
            L ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).y}
            L ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).y}
            Z
          `}
          fill={COLORS.panel}
          stroke={COLORS.accent}
          strokeWidth="2"
          opacity="0.9"
        />
      )}

      {/* Rear panel (RIGHT end) */}
      {config.rearPanel && (
        <path
          d={`
            M ${iso(frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, -frameSize.width / 2, 0).y}
            L ${iso(frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, frameSize.width / 2, 0).y}
            L ${iso(frameSize.length / 2, frameSize.width / 2, frameSize.height).x} ${iso(frameSize.length / 2, frameSize.width / 2, frameSize.height).y}
            L ${iso(frameSize.length / 2, -frameSize.width / 2, frameSize.height).x} ${iso(frameSize.length / 2, -frameSize.width / 2, frameSize.height).y}
            Z
          `}
          fill={COLORS.panel}
          stroke={COLORS.accent}
          strokeWidth="2"
          opacity="0.9"
        />
      )}

      {/* Propane tank on FRONT side near right */}
      {config.propaneTank && (
        <g>
          {(() => {
            const tankPos = iso(frameSize.length / 4, frameSize.width / 2 - 12, frameSize.height / 2);
            return (
              <>
                <ellipse cx={tankPos.x} cy={tankPos.y + 12} rx="18" ry="9" fill={COLORS.propane} stroke="#333" strokeWidth="2" />
                <rect x={tankPos.x - 18} y={tankPos.y - 22} width="36" height="34" rx="6" fill={COLORS.propane} stroke="#333" strokeWidth="2" />
                <rect x={tankPos.x - 12} y={tankPos.y - 30} width="24" height="8" rx="3" fill="#ccc" stroke="#333" strokeWidth="2" />
              </>
            );
          })()}
        </g>
      )}

      {/* Wheels and axle - positioned toward rear, always visible */}
      <g>
        {(() => {
          const axleX = frameSize.length / 2.5;  // Rear position
          const wheelY = frameSize.width / 2 + 5;
          const leftWheel = iso(axleX, -wheelY, 0);
          const rightWheel = iso(axleX, wheelY, 0);
          const axleLeft = iso(axleX, -wheelY, 8);
          const axleRight = iso(axleX, wheelY, 8);

          return (
            <>
              {/* Axle tube */}
              <line x1={axleLeft.x} y1={axleLeft.y} x2={axleRight.x} y2={axleRight.y} stroke={COLORS.steel} strokeWidth="6" />
              
              {/* Left wheel */}
              <g>
                <circle cx={leftWheel.x} cy={leftWheel.y} r={wheelSpecs.radius} fill={wheelSpecs.color} />
                {/* Aggressive tread pattern */}
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i / 16) * Math.PI * 2;
                  const x1 = leftWheel.x + Math.cos(angle) * (wheelSpecs.radius - 2);
                  const y1 = leftWheel.y + Math.sin(angle) * (wheelSpecs.radius - 2);
                  const x2 = leftWheel.x + Math.cos(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  const y2 = leftWheel.y + Math.sin(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  return <line key={`tread-l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth="2" />;
                })}
                {/* Rim */}
                <circle cx={leftWheel.x} cy={leftWheel.y} r={wheelSpecs.rimSize} fill={COLORS.rim} stroke="#000" strokeWidth="2" />
                {/* Spokes */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const x = leftWheel.x + Math.cos(angle) * (wheelSpecs.rimSize - 4);
                  const y = leftWheel.y + Math.sin(angle) * (wheelSpecs.rimSize - 4);
                  return <circle key={`spoke-l-${i}`} cx={x} cy={y} r="2" fill="#333" />;
                })}
              </g>

              {/* Right wheel */}
              <g>
                <circle cx={rightWheel.x} cy={rightWheel.y} r={wheelSpecs.radius} fill={wheelSpecs.color} />
                {/* Aggressive tread pattern */}
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i / 16) * Math.PI * 2;
                  const x1 = rightWheel.x + Math.cos(angle) * (wheelSpecs.radius - 2);
                  const y1 = rightWheel.y + Math.sin(angle) * (wheelSpecs.radius - 2);
                  const x2 = rightWheel.x + Math.cos(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  const y2 = rightWheel.y + Math.sin(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  return <line key={`tread-r-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth="2" />;
                })}
                {/* Rim */}
                <circle cx={rightWheel.x} cy={rightWheel.y} r={wheelSpecs.rimSize} fill={COLORS.rim} stroke="#000" strokeWidth="2" />
                {/* Spokes */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const x = rightWheel.x + Math.cos(angle) * (wheelSpecs.rimSize - 4);
                  const y = rightWheel.y + Math.sin(angle) * (wheelSpecs.rimSize - 4);
                  return <circle key={`spoke-r-${i}`} cx={x} cy={y} r="2" fill="#333" />;
                })}
              </g>

              {/* Fenders */}
              {config.fenders && (
                <>
                  <path
                    d={`
                      M ${iso(axleX - 8, -wheelY - 8, wheelSpecs.radius + 8).x} ${iso(axleX - 8, -wheelY - 8, wheelSpecs.radius + 8).y}
                      L ${iso(axleX + wheelSpecs.radius + 12, -wheelY - 8, wheelSpecs.radius + 10).x} ${iso(axleX + wheelSpecs.radius + 12, -wheelY - 8, wheelSpecs.radius + 10).y}
                      L ${iso(axleX + wheelSpecs.radius + 12, -wheelY + 8, wheelSpecs.radius + 10).x} ${iso(axleX + wheelSpecs.radius + 12, -wheelY + 8, wheelSpecs.radius + 10).y}
                      L ${iso(axleX - 8, -wheelY + 8, wheelSpecs.radius + 8).x} ${iso(axleX - 8, -wheelY + 8, wheelSpecs.radius + 8).y}
                      Z
                    `}
                    fill={COLORS.panel}
                    stroke={COLORS.accent}
                    strokeWidth="2"
                  />
                  <path
                    d={`
                      M ${iso(axleX - 8, wheelY - 8, wheelSpecs.radius + 8).x} ${iso(axleX - 8, wheelY - 8, wheelSpecs.radius + 8).y}
                      L ${iso(axleX + wheelSpecs.radius + 12, wheelY - 8, wheelSpecs.radius + 10).x} ${iso(axleX + wheelSpecs.radius + 12, wheelY - 8, wheelSpecs.radius + 10).y}
                      L ${iso(axleX + wheelSpecs.radius + 12, wheelY + 8, wheelSpecs.radius + 10).x} ${iso(axleX + wheelSpecs.radius + 12, wheelY + 8, wheelSpecs.radius + 10).y}
                      L ${iso(axleX - 8, wheelY + 8, wheelSpecs.radius + 8).x} ${iso(axleX - 8, wheelY + 8, wheelSpecs.radius + 8).y}
                      Z
                    `}
                    fill={COLORS.panel}
                    stroke={COLORS.accent}
                    strokeWidth="2"
                  />
                </>
              )}
            </>
          );
        })()}
      </g>

      {/* Roof platform */}
      {config.roofPlatform && (
        <path
          d={`
            M ${iso(-frameSize.length / 2 + 8, -frameSize.width / 2 + 8, frameSize.height).x} ${iso(-frameSize.length / 2 + 8, -frameSize.width / 2 + 8, frameSize.height).y}
            L ${iso(frameSize.length / 2 - 8, -frameSize.width / 2 + 8, frameSize.height).x} ${iso(frameSize.length / 2 - 8, -frameSize.width / 2 + 8, frameSize.height).y}
            L ${iso(frameSize.length / 2 - 8, frameSize.width / 2 - 8, frameSize.height).x} ${iso(frameSize.length / 2 - 8, frameSize.width / 2 - 8, frameSize.height).y}
            L ${iso(-frameSize.length / 2 + 8, frameSize.width / 2 - 8, frameSize.height).x} ${iso(-frameSize.length / 2 + 8, frameSize.width / 2 - 8, frameSize.height).y}
            Z
          `}
          fill="#333"
          stroke="#000"
          strokeWidth="2"
        />
      )}

      {/* Roof rack */}
      {config.roofRack && (
        <g stroke={COLORS.steel} strokeWidth="4">
          {/* Rails */}
          <line
            x1={iso(-frameSize.length / 2 + 12, -frameSize.width / 2 + 12, frameSize.height + 8).x}
            y1={iso(-frameSize.length / 2 + 12, -frameSize.width / 2 + 12, frameSize.height + 8).y}
            x2={iso(frameSize.length / 2 - 12, -frameSize.width / 2 + 12, frameSize.height + 8).x}
            y2={iso(frameSize.length / 2 - 12, -frameSize.width / 2 + 12, frameSize.height + 8).y}
          />
          <line
            x1={iso(-frameSize.length / 2 + 12, frameSize.width / 2 - 12, frameSize.height + 8).x}
            y1={iso(-frameSize.length / 2 + 12, frameSize.width / 2 - 12, frameSize.height + 8).y}
            x2={iso(frameSize.length / 2 - 12, frameSize.width / 2 - 12, frameSize.height + 8).x}
            y2={iso(frameSize.length / 2 - 12, frameSize.width / 2 - 12, frameSize.height + 8).y}
          />
          {/* Cross bars */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`crossbar-${i}`}
              x1={iso(-frameSize.length / 2 + 15 + i * (frameSize.length / 6), -frameSize.width / 2 + 12, frameSize.height + 8).x}
              y1={iso(-frameSize.length / 2 + 15 + i * (frameSize.length / 6), -frameSize.width / 2 + 12, frameSize.height + 8).y}
              x2={iso(-frameSize.length / 2 + 15 + i * (frameSize.length / 6), frameSize.width / 2 - 12, frameSize.height + 8).x}
              y2={iso(-frameSize.length / 2 + 15 + i * (frameSize.length / 6), frameSize.width / 2 - 12, frameSize.height + 8).y}
            />
          ))}
        </g>
      )}

      {/* Roof tent */}
      {config.roofTent && (
        <g>
          {/* Tent base */}
          <path
            d={`
              M ${iso(-frameSize.length / 2 + 20, -frameSize.width / 2 + 16, frameSize.height + 12).x} ${iso(-frameSize.length / 2 + 20, -frameSize.width / 2 + 16, frameSize.height + 12).y}
              L ${iso(frameSize.length / 2 - 20, -frameSize.width / 2 + 16, frameSize.height + 12).x} ${iso(frameSize.length / 2 - 20, -frameSize.width / 2 + 16, frameSize.height + 12).y}
              L ${iso(frameSize.length / 2 - 20, frameSize.width / 2 - 16, frameSize.height + 12).x} ${iso(frameSize.length / 2 - 20, frameSize.width / 2 - 16, frameSize.height + 12).y}
              L ${iso(-frameSize.length / 2 + 20, frameSize.width / 2 - 16, frameSize.height + 12).x} ${iso(-frameSize.length / 2 + 20, frameSize.width / 2 - 16, frameSize.height + 12).y}
              Z
            `}
            fill="#2d4a2d"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Tent peak */}
          <path
            d={`
              M ${iso(-frameSize.length / 2 + 20, -frameSize.width / 2 + 16, frameSize.height + 12).x} ${iso(-frameSize.length / 2 + 20, -frameSize.width / 2 + 16, frameSize.height + 12).y}
              L ${iso(0, 0, frameSize.height + 45).x} ${iso(0, 0, frameSize.height + 45).y}
              L ${iso(frameSize.length / 2 - 20, -frameSize.width / 2 + 16, frameSize.height + 12).x} ${iso(frameSize.length / 2 - 20, -frameSize.width / 2 + 16, frameSize.height + 12).y}
            `}
            fill="#3d5a3d"
            stroke="#000"
            strokeWidth="2"
          />
          {/* ROAM logo */}
          <rect
            x={iso(10, -frameSize.width / 2 + 16, frameSize.height + 25).x - 25}
            y={iso(10, -frameSize.width / 2 + 16, frameSize.height + 25).y - 8}
            width="50"
            height="16"
            fill="#1a1a1a"
            rx="3"
          />
          <text
            x={iso(10, -frameSize.width / 2 + 16, frameSize.height + 25).x}
            y={iso(10, -frameSize.width / 2 + 16, frameSize.height + 25).y + 4}
            fontSize="10"
            textAnchor="middle"
            fill={COLORS.accent}
            fontWeight="bold"
          >
            ROAM
          </text>
        </g>
      )}
      
      {/* Side door on RIGHT long side - RENDERED LAST FOR TOP LAYER */}
      {config.sideAccessDoors && (
        <g>
          {(() => {
            // Door positioned on right side panel, scaled up much larger
            const doorX = -frameSize.length / 4; // Position on right side of trailer
            const doorCenter = iso(doorX, frameSize.width / 2, frameSize.height / 2); // On right long side panel
            const doorWidth = 90;  // Much much larger door width
            const doorHeight = 108; // Much much larger door height
            return (
              <>
                {/* Door frame */}
                <rect
                  x={doorCenter.x - doorWidth/2}
                  y={doorCenter.y - doorHeight/2}
                  width={doorWidth}
                  height={doorHeight}
                  rx="12"
                  fill="#1a1a1a"
                  stroke="#000"
                  strokeWidth="3"
                />
                {/* Door panel */}
                <rect
                  x={doorCenter.x - doorWidth/2 + 3}
                  y={doorCenter.y - doorHeight/2 + 3}
                  width={doorWidth - 6}
                  height={doorHeight - 6}
                  rx="9"
                  fill={COLORS.panel}
                  stroke="#333"
                  strokeWidth="2"
                />
                {/* Window */}
                <rect
                  x={doorCenter.x - 30}
                  y={doorCenter.y - 36}
                  width="60"
                  height="48"
                  rx="12"
                  fill="#4a90e2"
                  opacity="0.3"
                  stroke="#333"
                  strokeWidth="2"
                />
                {/* Handle */}
                <circle cx={doorCenter.x + 30} cy={doorCenter.y + 24} r="6" fill="#999" stroke="#666" strokeWidth="1" />
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
};

export default CamperConfigurator;
