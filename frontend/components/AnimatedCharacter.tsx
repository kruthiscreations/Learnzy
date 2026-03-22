/**
 * AnimatedCharacter — Fully animated SVG bots for Learnzy
 * Characters: Cuty (cat), Candy (dog), Bunny (rabbit), Jumbo (elephant)
 * Expressions: idle | happy | thinking | speaking | excited | confused | proud
 * Each character has: floating body, blinking eyes, animated mouth, ear/trunk wiggles
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Rect, Line, Polygon } from 'react-native-svg';

export type Expression = 'idle' | 'happy' | 'thinking' | 'speaking' | 'excited' | 'confused' | 'proud';
export type CharacterType = 'cat' | 'dog' | 'rabbit' | 'elephant';

interface Props {
  character: CharacterType;
  expression: Expression;
  size?: number;
  showSpeechBubble?: boolean;
  speechText?: string;
}

// ── Animation hooks ──────────────────────────────────────────────────────────
function useFloatAnim() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -8, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0,  duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return anim;
}

function useBlinkAnim() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const doBlink = () => {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.05, duration: 80,  useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,    duration: 100, useNativeDriver: true }),
        ]).start(() => doBlink());
      }, 2500 + Math.random() * 2500);
    };
    doBlink();
  }, []);
  return anim;
}

function useBounceAnim(active: boolean) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.12, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,    duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else {
      anim.setValue(1);
    }
  }, [active]);
  return anim;
}

function useTiltAnim(thinking: boolean) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (thinking) {
      Animated.timing(anim, { toValue: -12, duration: 400, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [thinking]);
  return anim;
}

function useSpeakAnim(speaking: boolean) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (speaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }),
        ])
      ).start();
    } else {
      anim.setValue(0);
    }
  }, [speaking]);
  return anim;
}

// ── SVG Helper: Eyes by expression ───────────────────────────────────────────
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

function Eyes({ expr, blinkScale, cx1, cy, cx2, r, fill = '#2D1B69' }: {
  expr: Expression; blinkScale: Animated.Value;
  cx1: number; cy: number; cx2: number; r: number; fill?: string;
}) {
  // Eye shape variations
  if (expr === 'happy' || expr === 'proud') {
    // Squinting happy eyes (arcs)
    return (
      <G>
        <Path d={`M${cx1-r} ${cy} Q${cx1} ${cy-r*1.5} ${cx1+r} ${cy}`} stroke={fill} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Path d={`M${cx2-r} ${cy} Q${cx2} ${cy-r*1.5} ${cx2+r} ${cy}`} stroke={fill} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </G>
    );
  }
  if (expr === 'excited') {
    // Star-like eyes
    return (
      <G>
        <Circle cx={cx1} cy={cy} r={r+1} fill={fill} />
        <Circle cx={cx1} cy={cy} r={r*0.4} fill="#FFF" />
        <Circle cx={cx2} cy={cy} r={r+1} fill={fill} />
        <Circle cx={cx2} cy={cy} r={r*0.4} fill="#FFF" />
      </G>
    );
  }
  if (expr === 'confused') {
    // One eyebrow raised, slight squint on one side
    return (
      <G>
        <Ellipse cx={cx1} cy={cy} rx={r} ry={r*0.7} fill={fill} />
        <Ellipse cx={cx2} cy={cy} rx={r} ry={r}     fill={fill} />
        <Circle cx={cx1+r*0.3} cy={cy-r*0.3} r={r*0.35} fill="#FFF" />
        <Circle cx={cx2+r*0.3} cy={cy-r*0.3} r={r*0.35} fill="#FFF" />
      </G>
    );
  }
  if (expr === 'thinking') {
    return (
      <G>
        <Ellipse cx={cx1} cy={cy} rx={r} ry={r*0.6} fill={fill} />
        <Ellipse cx={cx2} cy={cy} rx={r} ry={r}     fill={fill} />
        <Circle cx={cx2+r*0.3} cy={cy-r*0.3} r={r*0.35} fill="#FFF" />
      </G>
    );
  }
  // Default (idle, speaking) — normal eyes with blink
  return (
    <G>
      <AnimatedEllipse cx={cx1} cy={cy} rx={r} ry={r} fill={fill}
        style={{ transform: [{ scaleY: blinkScale }] }} />
      <AnimatedEllipse cx={cx2} cy={cy} rx={r} ry={r} fill={fill}
        style={{ transform: [{ scaleY: blinkScale }] }} />
      <Circle cx={cx1+r*0.3} cy={cy-r*0.3} r={r*0.35} fill="#FFF" />
      <Circle cx={cx2+r*0.3} cy={cy-r*0.3} r={r*0.35} fill="#FFF" />
    </G>
  );
}

// ── Cat (Cuty) ────────────────────────────────────────────────────────────────
function CutyFace({ expr, blinkScale, speakAnim }: { expr: Expression; blinkScale: Animated.Value; speakAnim: Animated.Value }) {
  const mouthY = speakAnim.interpolate({ inputRange: [0, 1], outputRange: [78, 82] });
  return (
    <G>
      {/* Ears */}
      <Polygon points="28,28 20,8 42,22"  fill="#FF6B9D" />
      <Polygon points="32,28 24,10 44,24" fill="#FFB6CC" />
      <Polygon points="72,28 80,8  58,22" fill="#FF6B9D" />
      <Polygon points="68,28 76,10 56,24" fill="#FFB6CC" />
      {/* Face */}
      <Circle cx="50" cy="60" r="36" fill="#FF8CB4" />
      <Circle cx="50" cy="60" r="34" fill="#FFAECB" />
      {/* Cheeks */}
      <Ellipse cx="32" cy="70" rx="9" ry="6" fill="#FF6B9D" opacity={0.5} />
      <Ellipse cx="68" cy="70" rx="9" ry="6" fill="#FF6B9D" opacity={0.5} />
      {/* Eyes */}
      <Eyes expr={expr} blinkScale={blinkScale} cx1={38} cy={58} cx2={62} r={6} fill="#2D1B69" />
      {/* Nose */}
      <Ellipse cx="50" cy="70" rx="4" ry="3" fill="#FF4499" />
      {/* Whiskers */}
      <Line x1="10" y1="66" x2="36" y2="69" stroke="#CC3377" strokeWidth="1.5" opacity={0.7} />
      <Line x1="10" y1="72" x2="36" y2="72" stroke="#CC3377" strokeWidth="1.5" opacity={0.7} />
      <Line x1="64" y1="69" x2="90" y2="66" stroke="#CC3377" strokeWidth="1.5" opacity={0.7} />
      <Line x1="64" y1="72" x2="90" y2="72" stroke="#CC3377" strokeWidth="1.5" opacity={0.7} />
      {/* Mouth */}
      {expr === 'happy' || expr === 'excited' || expr === 'proud' ? (
        <Path d="M42 76 Q50 86 58 76" stroke="#CC3377" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : expr === 'confused' ? (
        <Path d="M44 79 Q50 75 56 79" stroke="#CC3377" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : expr === 'thinking' ? (
        <Ellipse cx="50" cy="78" rx="5" ry="3" fill="#CC3377" opacity={0.6} />
      ) : (
        // speaking/idle — animated
        <Animated.View style={{ position: 'absolute' }}>
          <Path d={`M44 76 Q50 ${82} 56 76`} stroke="#CC3377" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </Animated.View>
      )}
    </G>
  );
}

// ── Dog (Candy) ───────────────────────────────────────────────────────────────
function CandyFace({ expr, blinkScale, speakAnim }: { expr: Expression; blinkScale: Animated.Value; speakAnim: Animated.Value }) {
  return (
    <G>
      {/* Floppy ears */}
      <Ellipse cx="22" cy="58" rx="14" ry="22" fill="#C8854C" />
      <Ellipse cx="78" cy="58" rx="14" ry="22" fill="#C8854C" />
      <Ellipse cx="22" cy="60" rx="10" ry="17" fill="#E0A070" />
      <Ellipse cx="78" cy="60" rx="10" ry="17" fill="#E0A070" />
      {/* Face */}
      <Circle cx="50" cy="55" r="34" fill="#D4935A" />
      <Circle cx="50" cy="55" r="32" fill="#E8AA78" />
      {/* Snout */}
      <Ellipse cx="50" cy="71" rx="14" ry="10" fill="#C8854C" />
      {/* Cheeks */}
      <Ellipse cx="32" cy="62" rx="8" ry="6" fill="#D4766A" opacity={0.4} />
      <Ellipse cx="68" cy="62" rx="8" ry="6" fill="#D4766A" opacity={0.4} />
      {/* Eyes */}
      <Eyes expr={expr} blinkScale={blinkScale} cx1={38} cy={50} cx2={62} r={6} fill="#3D1F00" />
      {/* Nose */}
      <Ellipse cx="50" cy="67" rx="7" ry="5" fill="#3D1F00" />
      <Ellipse cx="48" cy="65.5" rx="2.5" ry="1.5" fill="#5A3A1A" opacity={0.5} />
      {/* Mouth */}
      {expr === 'happy' || expr === 'excited' || expr === 'proud' ? (
        <>
          <Path d="M40 75 Q50 86 60 75" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Ellipse cx="50" cy="80" rx="8" ry="5" fill="#FF8A80" opacity={0.8} />
        </>
      ) : expr === 'confused' ? (
        <Path d="M43 78 Q50 74 57 78" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : expr === 'thinking' ? (
        <Path d="M43 76 Q50 80 57 76" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <Path d="M43 75 Q50 83 57 75" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
    </G>
  );
}

// ── Rabbit (Bunny) ────────────────────────────────────────────────────────────
function BunnyFace({ expr, blinkScale, speakAnim }: { expr: Expression; blinkScale: Animated.Value; speakAnim: Animated.Value }) {
  return (
    <G>
      {/* Long ears */}
      <Ellipse cx="36" cy="20" rx="10" ry="22" fill="#E8D4FF" />
      <Ellipse cx="64" cy="20" rx="10" ry="22" fill="#E8D4FF" />
      <Ellipse cx="36" cy="20" rx="6"  ry="17" fill="#FFB6D9" />
      <Ellipse cx="64" cy="20" rx="6"  ry="17" fill="#FFB6D9" />
      {/* Face */}
      <Circle cx="50" cy="62" r="33" fill="#F0E6FF" />
      <Circle cx="50" cy="62" r="31" fill="#F8F0FF" />
      {/* Cheeks */}
      <Ellipse cx="31" cy="70" rx="9" ry="6"  fill="#FFB6D9" opacity={0.5} />
      <Ellipse cx="69" cy="70" rx="9" ry="6"  fill="#FFB6D9" opacity={0.5} />
      {/* Eyes */}
      <Eyes expr={expr} blinkScale={blinkScale} cx1={38} cy={60} cx2={62} r={6} fill="#6B21A8" />
      {/* Nose */}
      <Ellipse cx="50" cy="70" rx="4" ry="3" fill="#FF8CB4" />
      {/* Mouth & teeth */}
      {expr === 'happy' || expr === 'excited' || expr === 'proud' ? (
        <>
          <Path d="M42 74 Q50 82 58 74" stroke="#9D4EDD" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Rect x="46" y="74" width="8" height="6" rx="1.5" fill="white" stroke="#DDD" strokeWidth="0.5" />
        </>
      ) : expr === 'confused' ? (
        <Path d="M44 77 Q50 73 56 77" stroke="#9D4EDD" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <Path d="M43 74 Q50 80 57 74" stroke="#9D4EDD" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Rect x="46" y="74" width="8" height="5" rx="1" fill="white" stroke="#EEE" strokeWidth="0.5" />
        </>
      )}
    </G>
  );
}

// ── Elephant (Jumbo) ──────────────────────────────────────────────────────────
function JumboFace({ expr, blinkScale, speakAnim }: { expr: Expression; blinkScale: Animated.Value; speakAnim: Animated.Value }) {
  return (
    <G>
      {/* Big ears */}
      <Ellipse cx="16" cy="55" rx="16" ry="26" fill="#7CB9E8" />
      <Ellipse cx="84" cy="55" rx="16" ry="26" fill="#7CB9E8" />
      <Ellipse cx="16" cy="57" rx="11" ry="19" fill="#A8D8F0" />
      <Ellipse cx="84" cy="57" rx="11" ry="19" fill="#A8D8F0" />
      {/* Head */}
      <Circle cx="50" cy="52" r="34" fill="#8BBFE8" />
      <Circle cx="50" cy="52" r="32" fill="#A8D4F5" />
      {/* Trunk */}
      <Path d="M42 80 Q36 90 40 100 Q44 108 48 100 Q50 94 52 100 Q56 108 60 100 Q64 90 58 80 Q54 84 50 82 Q46 84 42 80 Z" fill="#8BBFE8" />
      {/* Eyes */}
      <Eyes expr={expr} blinkScale={blinkScale} cx1={36} cy={48} cx2={64} r={7} fill="#1E3A5F" />
      {/* Cheeks */}
      <Ellipse cx="30" cy="62" rx="9" ry="6" fill="#6AA8D8" opacity={0.4} />
      <Ellipse cx="70" cy="62" rx="9" ry="6" fill="#6AA8D8" opacity={0.4} />
      {/* Mouth on trunk */}
      {expr === 'happy' || expr === 'excited' || expr === 'proud' ? (
        <Path d="M42 80 Q50 88 58 80" stroke="#4A90C4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : expr === 'confused' ? (
        <Path d="M44 82 Q50 78 56 82" stroke="#4A90C4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : expr === 'thinking' ? (
        <Ellipse cx="50" cy="80" rx="5" ry="3" fill="#4A90C4" opacity={0.5} />
      ) : (
        <Path d="M43 80 Q50 86 57 80" stroke="#4A90C4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* Tusks */}
      <Path d="M40 84 Q34 90 36 96" stroke="ivory" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M60 84 Q66 90 64 96" stroke="ivory" strokeWidth="3" fill="none" strokeLinecap="round" />
    </G>
  );
}

// ── Thought dots (thinking) ───────────────────────────────────────────────────
function ThinkingDots() {
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const dot = (v: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1,   duration: 400, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]));
    Animated.parallel([dot(d1, 0), dot(d2, 200), dot(d3, 400)]).start();
  }, []);
  return (
    <View style={styles.dotsRow}>
      {[d1, d2, d3].map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
      ))}
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AnimatedCharacter({ character, expression, size = 150 }: Props) {
  const floatY    = useFloatAnim();
  const blinkScale = useBlinkAnim();
  const bounceScale = useBounceAnim(expression === 'excited');
  const tiltRot   = useTiltAnim(expression === 'thinking' || expression === 'confused');
  const speakAnim = useSpeakAnim(expression === 'speaking');

  const faceProps = { expr: expression, blinkScale, speakAnim };
  const vb = "0 0 100 110";

  return (
    <View style={[styles.wrapper, { width: size, height: size * 1.15 }]}>
      <Animated.View style={{
        transform: [
          { translateY: floatY },
          { scale: bounceScale },
          { rotate: tiltRot.interpolate({ inputRange: [-12, 0], outputRange: ['-12deg', '0deg'] }) },
        ],
      }}>
        <Svg width={size} height={size * 1.05} viewBox={vb}>
          {/* Shadow */}
          <Ellipse cx="50" cy="108" rx="26" ry="5" fill="rgba(0,0,0,0.12)" />
          {character === 'cat'      && <CutyFace  {...faceProps} />}
          {character === 'dog'      && <CandyFace {...faceProps} />}
          {character === 'rabbit'   && <BunnyFace {...faceProps} />}
          {character === 'elephant' && <JumboFace {...faceProps} />}
        </Svg>

        {/* Thinking dots */}
        {expression === 'thinking' && <ThinkingDots />}

        {/* Sparkles for excited/proud */}
        {(expression === 'excited' || expression === 'proud') && (
          <View style={styles.sparkles} pointerEvents="none">
            {['✨','⭐','🌟'].map((s, i) => (
              <Animated.Text key={i} style={[styles.sparkle, { opacity: bounceScale, left: i * 28 }]}>
                {s}
              </Animated.Text>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: -8, gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1' },
  sparkles: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row' },
  sparkle: { position: 'absolute', top: -10, fontSize: 16 },
});
