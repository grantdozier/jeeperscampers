import React from 'react';

interface CamperConfig {
  frame: string;
  wheels: string;
  enclosureType: string;
  rearHatch: boolean;
  partitionKitchenCounter: boolean;
  kitchenStoveTop: boolean;
  kitchenFridge: boolean;
  roofTent: string;
  diamondPlateFrontExterior: boolean;
  vNoseFrontStorage: boolean;
  frontStorageBoxes: boolean;
  toolBoxDPlated: boolean;
  onboardPropaneTank: boolean;
  roofTopAccessSteps: boolean;
  [key: string]: any;
}

interface CamperConfiguratorProps {
  config: CamperConfig;
}

const CamperConfigurator: React.FC<CamperConfiguratorProps> = ({ config }) => {
  // Frame dimensions - scaled for better visibility
  const frameSize = { width: 100, length: 180, height: 70 }; // Larger scale for 6'9" × 12' × ~5'

  const viewBoxWidth = 1000;
  const viewBoxHeight = 700;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2 + 50;

  // Premium color palette
  const COLORS = {
    body: '#2c2c2c',
    panel: '#1a1a1a',
    panelLight: '#3a3a3a',
    accent: '#f97316',
    shadow: 'rgba(0,0,0,0.4)',
    steel: '#5a6268',
    steelLight: '#6c757d',
    diamond: '#9ca3af',
    tire: '#1a1a1a',
    tireDetail: '#2a2a2a',
    rim: '#d1d5db',
    rimShine: '#f3f4f6',
    propane: '#e8e8e8',
    wood: '#8b4513',
    roofTent: '#2d4a2d',
    roofTentLight: '#3d5a3d',
  };

  // Isometric projection with better perspective
  const iso = (x: number, y: number, z: number) => {
    const scale = 2.8;
    const isoX = centerX + (x - y) * 0.866 * scale;
    const isoY = centerY + (x + y) * 0.5 * scale - z * scale;
    return { x: isoX, y: isoY };
  };

  // Enhanced wheel specifications
  const getWheelSpecs = () => {
    switch (config.wheels) {
      case 'standard':
        return { radius: 35, treadDepth: 5, rimSize: 24, spokeCount: 6, color: '#2a2a2a' };
      case 'offroad':
        return { radius: 38, treadDepth: 8, rimSize: 26, spokeCount: 8, color: '#1a1a1a' };
      case 'extreme':
        return { radius: 42, treadDepth: 10, rimSize: 28, spokeCount: 10, color: '#0a0a0a' };
      default:
        return { radius: 35, treadDepth: 5, rimSize: 24, spokeCount: 6, color: '#2a2a2a' };
    }
  };

  const wheelSpecs = getWheelSpecs();

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full">
      {/* Enhanced ground shadow with gradient */}
      <defs>
        <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6c757d" />
          <stop offset="50%" stopColor="#5a6268" />
          <stop offset="100%" stopColor="#4a4f54" />
        </linearGradient>
        <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#2c2c2c" />
        </linearGradient>
      </defs>

      <ellipse
        cx={centerX}
        cy={centerY + 220}
        rx={frameSize.length * 1.4}
        ry={frameSize.width * 0.6}
        fill="url(#shadowGradient)"
      />

      {/* Hitch tongue pointing LEFT with better detail */}
      <g>
        {(() => {
          const tongueEnd = iso(-frameSize.length / 2 - 55, 0, 0);
          const tongueLeft = iso(-frameSize.length / 2, -18, 0);
          const tongueRight = iso(-frameSize.length / 2, 18, 0);
          return (
            <>
              {/* Tongue beam */}
              <polygon
                points={`${tongueLeft.x},${tongueLeft.y} ${tongueRight.x},${tongueRight.y} ${tongueEnd.x},${tongueEnd.y}`}
                fill="url(#metalGradient)"
                stroke="#000"
                strokeWidth="2"
              />
              {/* Hitch ball socket */}
              <circle cx={tongueEnd.x - 10} cy={tongueEnd.y} r="8" fill={COLORS.steelLight} stroke="#000" strokeWidth="2" />
              <circle cx={tongueEnd.x - 10} cy={tongueEnd.y} r="4" fill="#333" />
            </>
          );
        })()}
      </g>

      {/* Main trailer frame with enhanced details */}
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
          fill={config.diamondPlateFrontExterior ? COLORS.diamond : COLORS.body}
          stroke="#000"
          strokeWidth="3"
        />

        {/* Enhanced diamond plate pattern */}
        {config.diamondPlateFrontExterior && (
          <g opacity="0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={`dp-h-${i}`}
                x1={iso(-frameSize.length / 2 + i * (frameSize.length / 19), -frameSize.width / 2, 0).x}
                y1={iso(-frameSize.length / 2 + i * (frameSize.length / 19), -frameSize.width / 2, 0).y}
                x2={iso(-frameSize.length / 2 + i * (frameSize.length / 19), frameSize.width / 2, 0).x}
                y2={iso(-frameSize.length / 2 + i * (frameSize.length / 19), frameSize.width / 2, 0).y}
                stroke="#555"
                strokeWidth="0.8"
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`dp-v-${i}`}
                x1={iso(-frameSize.length / 2, -frameSize.width / 2 + i * (frameSize.width / 11), 0).x}
                y1={iso(-frameSize.length / 2, -frameSize.width / 2 + i * (frameSize.width / 11), 0).y}
                x2={iso(frameSize.length / 2, -frameSize.width / 2 + i * (frameSize.width / 11), 0).x}
                y2={iso(frameSize.length / 2, -frameSize.width / 2 + i * (frameSize.width / 11), 0).y}
                stroke="#555"
                strokeWidth="0.8"
              />
            ))}
          </g>
        )}

        {/* Frame rails for structure */}
        <line
          x1={iso(-frameSize.length / 2, -frameSize.width / 2 + 5, 0).x}
          y1={iso(-frameSize.length / 2, -frameSize.width / 2 + 5, 0).y}
          x2={iso(frameSize.length / 2, -frameSize.width / 2 + 5, 0).x}
          y2={iso(frameSize.length / 2, -frameSize.width / 2 + 5, 0).y}
          stroke={COLORS.steelLight}
          strokeWidth="4"
        />
        <line
          x1={iso(-frameSize.length / 2, frameSize.width / 2 - 5, 0).x}
          y1={iso(-frameSize.length / 2, frameSize.width / 2 - 5, 0).y}
          x2={iso(frameSize.length / 2, frameSize.width / 2 - 5, 0).x}
          y2={iso(frameSize.length / 2, frameSize.width / 2 - 5, 0).y}
          stroke={COLORS.steelLight}
          strokeWidth="4"
        />
      </g>

      {/* V-Nose Front Storage */}
      {config.vNoseFrontStorage && (
        <g>
          <path
            d={`
              M ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).y}
              L ${iso(-frameSize.length / 2 - 35, 0, 0).x} ${iso(-frameSize.length / 2 - 35, 0, 0).y}
              L ${iso(-frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, frameSize.width / 2, 0).y}
              L ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).y}
              L ${iso(-frameSize.length / 2 - 35, 0, frameSize.height).x} ${iso(-frameSize.length / 2 - 35, 0, frameSize.height).y}
              L ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).y}
              Z
            `}
            fill={config.vNosePowderCoat ? COLORS.accent : COLORS.diamond}
            stroke={COLORS.accent}
            strokeWidth="2"
            opacity="0.95"
          />
          {/* V-Nose door handle */}
          <circle
            cx={iso(-frameSize.length / 2 - 20, 0, frameSize.height / 2).x}
            cy={iso(-frameSize.length / 2 - 20, 0, frameSize.height / 2).y}
            r="3"
            fill="#999"
          />
        </g>
      )}

      {/* Side panels with better shadows */}
      {config.enclosureType && (
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
            fill="url(#panelGradient)"
            stroke={COLORS.accent}
            strokeWidth="2.5"
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
            fill="url(#panelGradient)"
            stroke={COLORS.accent}
            strokeWidth="2.5"
            opacity="0.92"
          />

          {/* Premium side door(s) */}
          {config.enclosureType === 'single-door' && (
            <g>
              {(() => {
                const doorX = -frameSize.length / 5;
                const doorCenter = iso(doorX, frameSize.width / 2, frameSize.height / 2);
                const doorWidth = 75;
                const doorHeight = 95;
                return (
                  <>
                    <rect
                      x={doorCenter.x - doorWidth/2}
                      y={doorCenter.y - doorHeight/2}
                      width={doorWidth}
                      height={doorHeight}
                      rx="10"
                      fill={COLORS.panelLight}
                      stroke="#000"
                      strokeWidth="2.5"
                    />
                    <rect
                      x={doorCenter.x - doorWidth/2 + 3}
                      y={doorCenter.y - doorHeight/2 + 3}
                      width={doorWidth - 6}
                      height={doorHeight - 6}
                      rx="8"
                      fill={COLORS.panel}
                      stroke={COLORS.accent}
                      strokeWidth="1.5"
                    />
                    {/* Window */}
                    <rect
                      x={doorCenter.x - 25}
                      y={doorCenter.y - 30}
                      width="50"
                      height="40"
                      rx="10"
                      fill="#4a90e2"
                      opacity="0.4"
                      stroke="#333"
                      strokeWidth="2"
                    />
                    {/* Handle */}
                    <rect
                      x={doorCenter.x + 25}
                      y={doorCenter.y + 20}
                      width="8"
                      height="3"
                      rx="1.5"
                      fill="#999"
                    />
                  </>
                );
              })()}
            </g>
          )}

          {config.enclosureType === 'dual-door' && (
            <g>
              {/* Door 1 */}
              {(() => {
                const door1X = -frameSize.length / 3.5;
                const door1Center = iso(door1X, frameSize.width / 2, frameSize.height / 2);
                const doorWidth = 70;
                const doorHeight = 90;
                return (
                  <>
                    <rect
                      x={door1Center.x - doorWidth/2}
                      y={door1Center.y - doorHeight/2}
                      width={doorWidth}
                      height={doorHeight}
                      rx="8"
                      fill={COLORS.panelLight}
                      stroke="#000"
                      strokeWidth="2"
                    />
                    <rect
                      x={door1Center.x - doorWidth/2 + 2}
                      y={door1Center.y - doorHeight/2 + 2}
                      width={doorWidth - 4}
                      height={doorHeight - 4}
                      rx="6"
                      fill={COLORS.panel}
                      stroke={COLORS.accent}
                      strokeWidth="1.5"
                    />
                    <rect
                      x={door1Center.x - 20}
                      y={door1Center.y - 25}
                      width="40"
                      height="35"
                      rx="8"
                      fill="#4a90e2"
                      opacity="0.4"
                      stroke="#333"
                      strokeWidth="1.5"
                    />
                    <rect x={door1Center.x + 22} y={door1Center.y + 18} width="7" height="3" rx="1.5" fill="#999" />
                  </>
                );
              })()}
              {/* Door 2 */}
              {(() => {
                const door2X = frameSize.length / 6;
                const door2Center = iso(door2X, frameSize.width / 2, frameSize.height / 2);
                const doorWidth = 70;
                const doorHeight = 90;
                return (
                  <>
                    <rect
                      x={door2Center.x - doorWidth/2}
                      y={door2Center.y - doorHeight/2}
                      width={doorWidth}
                      height={doorHeight}
                      rx="8"
                      fill={COLORS.panelLight}
                      stroke="#000"
                      strokeWidth="2"
                    />
                    <rect
                      x={door2Center.x - doorWidth/2 + 2}
                      y={door2Center.y - doorHeight/2 + 2}
                      width={doorWidth - 4}
                      height={doorHeight - 4}
                      rx="6"
                      fill={COLORS.panel}
                      stroke={COLORS.accent}
                      strokeWidth="1.5"
                    />
                    <rect
                      x={door2Center.x - 20}
                      y={door2Center.y - 25}
                      width="40"
                      height="35"
                      rx="8"
                      fill="#4a90e2"
                      opacity="0.4"
                      stroke="#333"
                      strokeWidth="1.5"
                    />
                    <rect x={door2Center.x + 22} y={door2Center.y + 18} width="7" height="3" rx="1.5" fill="#999" />
                  </>
                );
              })()}
            </g>
          )}
        </>
      )}

      {/* Front panel */}
      {config.enclosureType && !config.vNoseFrontStorage && (
        <path
          d={`
            M ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, 0).y}
            L ${iso(-frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(-frameSize.length / 2, frameSize.width / 2, 0).y}
            L ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, frameSize.width / 2, frameSize.height).y}
            L ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).x} ${iso(-frameSize.length / 2, -frameSize.width / 2, frameSize.height).y}
            Z
          `}
          fill="url(#panelGradient)"
          stroke={COLORS.accent}
          strokeWidth="2.5"
          opacity="0.9"
        />
      )}

      {/* Rear panel/hatch with opening visualization */}
      {config.rearHatch && (
        <g>
          <path
            d={`
              M ${iso(frameSize.length / 2, -frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, -frameSize.width / 2, 0).y}
              L ${iso(frameSize.length / 2, frameSize.width / 2, 0).x} ${iso(frameSize.length / 2, frameSize.width / 2, 0).y}
              L ${iso(frameSize.length / 2, frameSize.width / 2, frameSize.height).x} ${iso(frameSize.length / 2, frameSize.width / 2, frameSize.height).y}
              L ${iso(frameSize.length / 2, -frameSize.width / 2, frameSize.height).x} ${iso(frameSize.length / 2, -frameSize.width / 2, frameSize.height).y}
              Z
            `}
            fill="url(#panelGradient)"
            stroke={COLORS.accent}
            strokeWidth="2.5"
            opacity="0.9"
          />

          {/* Kitchen counter visible through hatch */}
          {config.partitionKitchenCounter && (
            <g>
              {/* Counter surface */}
              <rect
                x={iso(frameSize.length / 2 - 2, -frameSize.width / 2 + 10, frameSize.height * 0.6).x - 40}
                y={iso(frameSize.length / 2 - 2, -frameSize.width / 2 + 10, frameSize.height * 0.6).y - 8}
                width="80"
                height="16"
                rx="2"
                fill={COLORS.wood}
                stroke="#333"
                strokeWidth="1.5"
              />
              {/* Stove */}
              {config.kitchenStoveTop && (
                <circle
                  cx={iso(frameSize.length / 2 - 2, -frameSize.width / 2 + 15, frameSize.height * 0.6 + 2).x - 20}
                  cy={iso(frameSize.length / 2 - 2, -frameSize.width / 2 + 15, frameSize.height * 0.6 + 2).y}
                  r="5"
                  fill="#333"
                  stroke={COLORS.accent}
                  strokeWidth="1"
                />
              )}
              {/* Fridge indicator */}
              {config.kitchenFridge && (
                <rect
                  x={iso(frameSize.length / 2 - 2, frameSize.width / 2 - 20, frameSize.height * 0.4).x - 10}
                  y={iso(frameSize.length / 2 - 2, frameSize.width / 2 - 20, frameSize.height * 0.4).y - 15}
                  width="20"
                  height="30"
                  rx="2"
                  fill="#e8e8e8"
                  stroke="#999"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}

          {/* Hatch hinges */}
          <circle cx={iso(frameSize.length / 2, -frameSize.width / 2 + 10, 0).x} cy={iso(frameSize.length / 2, -frameSize.width / 2 + 10, 0).y} r="4" fill={COLORS.steel} />
          <circle cx={iso(frameSize.length / 2, frameSize.width / 2 - 10, 0).x} cy={iso(frameSize.length / 2, frameSize.width / 2 - 10, 0).y} r="4" fill={COLORS.steel} />

          {/* Hatch handles */}
          <rect
            x={iso(frameSize.length / 2, 0, frameSize.height / 2).x - 15}
            y={iso(frameSize.length / 2, 0, frameSize.height / 2).y - 4}
            width="30"
            height="8"
            rx="4"
            fill="#999"
            stroke="#666"
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* Front Storage Boxes */}
      {config.frontStorageBoxes && (
        <>
          {/* Left storage box */}
          <rect
            x={iso(-frameSize.length / 2 + 15, -frameSize.width / 2, frameSize.height + 5).x - 20}
            y={iso(-frameSize.length / 2 + 15, -frameSize.width / 2, frameSize.height + 5).y - 15}
            width="40"
            height="30"
            rx="3"
            fill={config.diamondPlateFrontExterior ? COLORS.diamond : COLORS.panelLight}
            stroke="#000"
            strokeWidth="2"
          />
          {/* Right storage box */}
          <rect
            x={iso(-frameSize.length / 2 + 15, frameSize.width / 2, frameSize.height + 5).x - 20}
            y={iso(-frameSize.length / 2 + 15, frameSize.width / 2, frameSize.height + 5).y - 15}
            width="40"
            height="30"
            rx="3"
            fill={config.diamondPlateFrontExterior ? COLORS.diamond : COLORS.panelLight}
            stroke="#000"
            strokeWidth="2"
          />
        </>
      )}

      {/* Tool Box */}
      {config.toolBoxDPlated && (
        <rect
          x={iso(frameSize.length / 3, -frameSize.width / 2, frameSize.height + 5).x - 35}
          y={iso(frameSize.length / 3, -frameSize.width / 2, frameSize.height + 5).y - 12}
          width="70"
          height="24"
          rx="3"
          fill={config.toolBoxPowderCoat ? COLORS.accent : COLORS.diamond}
          stroke="#000"
          strokeWidth="2"
        />
      )}

      {/* Propane tank */}
      {config.onboardPropaneTank && (
        <g>
          {(() => {
            const tankPos = iso(frameSize.length / 4, frameSize.width / 2 - 15, frameSize.height / 2);
            return (
              <>
                <ellipse cx={tankPos.x} cy={tankPos.y + 16} rx="22" ry="11" fill={COLORS.propane} stroke="#333" strokeWidth="2" />
                <rect x={tankPos.x - 22} y={tankPos.y - 26} width="44" height="42" rx="8" fill={COLORS.propane} stroke="#333" strokeWidth="2" />
                <rect x={tankPos.x - 15} y={tankPos.y - 36} width="30" height="10" rx="4" fill="#ccc" stroke="#333" strokeWidth="2" />
                {/* Valve detail */}
                <circle cx={tankPos.x} cy={tankPos.y - 31} r="3" fill="#999" stroke="#666" strokeWidth="1" />
              </>
            );
          })()}
        </g>
      )}

      {/* Premium wheels and axle */}
      <g>
        {(() => {
          const axleX = frameSize.length / 2.3;
          const wheelY = frameSize.width / 2 + 8;
          const leftWheel = iso(axleX, -wheelY, 0);
          const rightWheel = iso(axleX, wheelY, 0);
          const axleLeft = iso(axleX, -wheelY, 10);
          const axleRight = iso(axleX, wheelY, 10);

          return (
            <>
              {/* Axle tube with shadow */}
              <line x1={axleLeft.x} y1={axleLeft.y + 2} x2={axleRight.x} y2={axleRight.y + 2} stroke="rgba(0,0,0,0.3)" strokeWidth="8" />
              <line x1={axleLeft.x} y1={axleLeft.y} x2={axleRight.x} y2={axleRight.y} stroke="url(#metalGradient)" strokeWidth="8" />

              {/* Left wheel with enhanced details */}
              <g>
                {/* Tire shadow */}
                <ellipse cx={leftWheel.x + 2} cy={leftWheel.y + 3} rx={wheelSpecs.radius + 2} ry={wheelSpecs.radius + 2} fill="rgba(0,0,0,0.3)" />
                {/* Tire */}
                <circle cx={leftWheel.x} cy={leftWheel.y} r={wheelSpecs.radius} fill={wheelSpecs.color} stroke="#000" strokeWidth="2.5" />
                {/* Tire sidewall detail */}
                <circle cx={leftWheel.x} cy={leftWheel.y} r={wheelSpecs.radius - 4} fill={COLORS.tireDetail} opacity="0.8" />

                {/* Aggressive tread pattern */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * Math.PI * 2;
                  const x1 = leftWheel.x + Math.cos(angle) * (wheelSpecs.radius - 2);
                  const y1 = leftWheel.y + Math.sin(angle) * (wheelSpecs.radius - 2);
                  const x2 = leftWheel.x + Math.cos(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  const y2 = leftWheel.y + Math.sin(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  return <line key={`tread-l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#444" strokeWidth="2.5" />;
                })}

                {/* Rim with gradient */}
                <circle cx={leftWheel.x} cy={leftWheel.y} r={wheelSpecs.rimSize} fill={COLORS.rim} stroke="#000" strokeWidth="2.5" />
                <circle cx={leftWheel.x} cy={leftWheel.y} r={wheelSpecs.rimSize - 3} fill={COLORS.rimShine} opacity="0.6" />

                {/* Center cap */}
                <circle cx={leftWheel.x} cy={leftWheel.y} r="8" fill={COLORS.steel} stroke="#000" strokeWidth="2" />

                {/* Spokes */}
                {Array.from({ length: wheelSpecs.spokeCount }).map((_, i) => {
                  const angle = (i / wheelSpecs.spokeCount) * Math.PI * 2;
                  const x1 = leftWheel.x + Math.cos(angle) * 8;
                  const y1 = leftWheel.y + Math.sin(angle) * 8;
                  const x2 = leftWheel.x + Math.cos(angle) * (wheelSpecs.rimSize - 3);
                  const y2 = leftWheel.y + Math.sin(angle) * (wheelSpecs.rimSize - 3);
                  return (
                    <line
                      key={`spoke-l-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={COLORS.steel}
                      strokeWidth="3"
                    />
                  );
                })}
              </g>

              {/* Right wheel (mirror of left) */}
              <g>
                <ellipse cx={rightWheel.x + 2} cy={rightWheel.y + 3} rx={wheelSpecs.radius + 2} ry={wheelSpecs.radius + 2} fill="rgba(0,0,0,0.3)" />
                <circle cx={rightWheel.x} cy={rightWheel.y} r={wheelSpecs.radius} fill={wheelSpecs.color} stroke="#000" strokeWidth="2.5" />
                <circle cx={rightWheel.x} cy={rightWheel.y} r={wheelSpecs.radius - 4} fill={COLORS.tireDetail} opacity="0.8" />

                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * Math.PI * 2;
                  const x1 = rightWheel.x + Math.cos(angle) * (wheelSpecs.radius - 2);
                  const y1 = rightWheel.y + Math.sin(angle) * (wheelSpecs.radius - 2);
                  const x2 = rightWheel.x + Math.cos(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  const y2 = rightWheel.y + Math.sin(angle) * (wheelSpecs.radius - wheelSpecs.treadDepth);
                  return <line key={`tread-r-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#444" strokeWidth="2.5" />;
                })}

                <circle cx={rightWheel.x} cy={rightWheel.y} r={wheelSpecs.rimSize} fill={COLORS.rim} stroke="#000" strokeWidth="2.5" />
                <circle cx={rightWheel.x} cy={rightWheel.y} r={wheelSpecs.rimSize - 3} fill={COLORS.rimShine} opacity="0.6" />
                <circle cx={rightWheel.x} cy={rightWheel.y} r="8" fill={COLORS.steel} stroke="#000" strokeWidth="2" />

                {Array.from({ length: wheelSpecs.spokeCount }).map((_, i) => {
                  const angle = (i / wheelSpecs.spokeCount) * Math.PI * 2;
                  const x1 = rightWheel.x + Math.cos(angle) * 8;
                  const y1 = rightWheel.y + Math.sin(angle) * 8;
                  const x2 = rightWheel.x + Math.cos(angle) * (wheelSpecs.rimSize - 3);
                  const y2 = rightWheel.y + Math.sin(angle) * (wheelSpecs.rimSize - 3);
                  return (
                    <line
                      key={`spoke-r-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={COLORS.steel}
                      strokeWidth="3"
                    />
                  );
                })}
              </g>
            </>
          );
        })()}
      </g>

      {/* Roof platform */}
      {config.roofTent && (
        <path
          d={`
            M ${iso(-frameSize.length / 2 + 10, -frameSize.width / 2 + 10, frameSize.height).x} ${iso(-frameSize.length / 2 + 10, -frameSize.width / 2 + 10, frameSize.height).y}
            L ${iso(frameSize.length / 2 - 10, -frameSize.width / 2 + 10, frameSize.height).x} ${iso(frameSize.length / 2 - 10, -frameSize.width / 2 + 10, frameSize.height).y}
            L ${iso(frameSize.length / 2 - 10, frameSize.width / 2 - 10, frameSize.height).x} ${iso(frameSize.length / 2 - 10, frameSize.width / 2 - 10, frameSize.height).y}
            L ${iso(-frameSize.length / 2 + 10, frameSize.width / 2 - 10, frameSize.height).x} ${iso(-frameSize.length / 2 + 10, frameSize.width / 2 - 10, frameSize.height).y}
            Z
          `}
          fill="#3a3a3a"
          stroke="#000"
          strokeWidth="2.5"
        />
      )}

      {/* Roof rack */}
      {config.roofTent && (
        <g stroke={COLORS.steel} strokeWidth="4">
          <line
            x1={iso(-frameSize.length / 2 + 15, -frameSize.width / 2 + 15, frameSize.height + 10).x}
            y1={iso(-frameSize.length / 2 + 15, -frameSize.width / 2 + 15, frameSize.height + 10).y}
            x2={iso(frameSize.length / 2 - 15, -frameSize.width / 2 + 15, frameSize.height + 10).x}
            y2={iso(frameSize.length / 2 - 15, -frameSize.width / 2 + 15, frameSize.height + 10).y}
          />
          <line
            x1={iso(-frameSize.length / 2 + 15, frameSize.width / 2 - 15, frameSize.height + 10).x}
            y1={iso(-frameSize.length / 2 + 15, frameSize.width / 2 - 15, frameSize.height + 10).y}
            x2={iso(frameSize.length / 2 - 15, frameSize.width / 2 - 15, frameSize.height + 10).x}
            y2={iso(frameSize.length / 2 - 15, frameSize.width / 2 - 15, frameSize.height + 10).y}
          />
          {/* Cross bars */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`crossbar-${i}`}
              x1={iso(-frameSize.length / 2 + 20 + i * (frameSize.length / 7), -frameSize.width / 2 + 15, frameSize.height + 10).x}
              y1={iso(-frameSize.length / 2 + 20 + i * (frameSize.length / 7), -frameSize.width / 2 + 15, frameSize.height + 10).y}
              x2={iso(-frameSize.length / 2 + 20 + i * (frameSize.length / 7), frameSize.width / 2 - 15, frameSize.height + 10).x}
              y2={iso(-frameSize.length / 2 + 20 + i * (frameSize.length / 7), frameSize.width / 2 - 15, frameSize.height + 10).y}
            />
          ))}
        </g>
      )}

      {/* Premium roof tent */}
      {config.roofTent && (
        <g>
          {/* Tent base */}
          <path
            d={`
              M ${iso(-frameSize.length / 2 + 25, -frameSize.width / 2 + 20, frameSize.height + 14).x} ${iso(-frameSize.length / 2 + 25, -frameSize.width / 2 + 20, frameSize.height + 14).y}
              L ${iso(frameSize.length / 2 - 25, -frameSize.width / 2 + 20, frameSize.height + 14).x} ${iso(frameSize.length / 2 - 25, -frameSize.width / 2 + 20, frameSize.height + 14).y}
              L ${iso(frameSize.length / 2 - 25, frameSize.width / 2 - 20, frameSize.height + 14).x} ${iso(frameSize.length / 2 - 25, frameSize.width / 2 - 20, frameSize.height + 14).y}
              L ${iso(-frameSize.length / 2 + 25, frameSize.width / 2 - 20, frameSize.height + 14).x} ${iso(-frameSize.length / 2 + 25, frameSize.width / 2 - 20, frameSize.height + 14).y}
              Z
            `}
            fill={COLORS.roofTent}
            stroke="#000"
            strokeWidth="2.5"
          />
          {/* Tent peak - different heights based on tier */}
          <path
            d={`
              M ${iso(-frameSize.length / 2 + 25, -frameSize.width / 2 + 20, frameSize.height + 14).x} ${iso(-frameSize.length / 2 + 25, -frameSize.width / 2 + 20, frameSize.height + 14).y}
              L ${iso(0, 0, frameSize.height + (config.roofTent === 'luxury' ? 60 : config.roofTent === 'premium' ? 50 : 42)).x} ${iso(0, 0, frameSize.height + (config.roofTent === 'luxury' ? 60 : config.roofTent === 'premium' ? 50 : 42)).y}
              L ${iso(frameSize.length / 2 - 25, -frameSize.width / 2 + 20, frameSize.height + 14).x} ${iso(frameSize.length / 2 - 25, -frameSize.width / 2 + 20, frameSize.height + 14).y}
            `}
            fill={COLORS.roofTentLight}
            stroke="#000"
            strokeWidth="2.5"
          />
          {/* ROAM logo */}
          <rect
            x={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).x - 32}
            y={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).y - 10}
            width="64"
            height="20"
            fill="#1a1a1a"
            rx="4"
          />
          <text
            x={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).x}
            y={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).y + 5}
            fontSize="13"
            fontWeight="bold"
            textAnchor="middle"
            fill={COLORS.accent}
          >
            ROAM
          </text>
          {/* Tier badge */}
          {config.roofTent === 'premium' && (
            <text
              x={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).x}
              y={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).y - 13}
              fontSize="8"
              textAnchor="middle"
              fill="#ffd700"
              fontWeight="bold"
            >
              PREMIUM
            </text>
          )}
          {config.roofTent === 'luxury' && (
            <text
              x={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).x}
              y={iso(15, -frameSize.width / 2 + 20, frameSize.height + 30).y - 13}
              fontSize="8"
              textAnchor="middle"
              fill="#e5e7eb"
              fontWeight="bold"
            >
              LUXURY
            </text>
          )}
        </g>
      )}

      {/* Roof access steps */}
      {config.roofTopAccessSteps && (
        <>
          {/* Left side steps */}
          <g>
            {[0, 1, 2].map((i) => (
              <rect
                key={`step-l-${i}`}
                x={iso(frameSize.length / 3, -frameSize.width / 2 - 2, (i + 1) * (frameSize.height / 4)).x - 12}
                y={iso(frameSize.length / 3, -frameSize.width / 2 - 2, (i + 1) * (frameSize.height / 4)).y - 3}
                width="24"
                height="6"
                rx="1"
                fill={COLORS.steel}
                stroke="#000"
                strokeWidth="1.5"
              />
            ))}
          </g>
          {/* Right side steps */}
          <g>
            {[0, 1, 2].map((i) => (
              <rect
                key={`step-r-${i}`}
                x={iso(frameSize.length / 3, frameSize.width / 2 + 2, (i + 1) * (frameSize.height / 4)).x - 12}
                y={iso(frameSize.length / 3, frameSize.width / 2 + 2, (i + 1) * (frameSize.height / 4)).y - 3}
                width="24"
                height="6"
                rx="1"
                fill={COLORS.steel}
                stroke="#000"
                strokeWidth="1.5"
              />
            ))}
          </g>
        </>
      )}
    </svg>
  );
};

export default CamperConfigurator;
