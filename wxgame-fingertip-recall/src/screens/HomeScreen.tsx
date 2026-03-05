import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Dimensions, Animated, Easing } from 'react-native';
import { COLORS, GameMode, MODE_CONFIG, THEMES, ThemeType, DIFFICULTY } from '../constants';
import { playBGM, stopBGM, playTap, playCorrect, playWrong, playWin, playLose } from '../utils/sound';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GridCell {
  id: number;
  emoji: string;
  isTarget: boolean;
  isRevealed: boolean;
  isCorrect: boolean | null;
}

type GameState = 'menu' | 'memorize' | 'playing' | 'result';

const MAX_CELL_SIZE = 70;
const getGridConfig = (level: number) => {
  const diffKey = Math.min(level + 1, 10) as keyof typeof DIFFICULTY;
  const diff = DIFFICULTY[diffKey];
  return {
    gridSize: diff.gridSize,
    targetCount: diff.targetCount,
    showTime: diff.showTime,
    cellSize: Math.min((SCREEN_WIDTH - 60) / diff.gridSize, MAX_CELL_SIZE),
  };
};

const AnimatedCell: React.FC<{ children: React.ReactNode; pulse: boolean; style?: any }> = ({ children, pulse, style }) => {
  const anim = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (pulse) {
      const p = Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1.1, duration: 400, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 400, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), useNativeDriver: true }),
      ]));
      p.start();
      return () => p.stop();
    }
  }, [pulse]);
  return <Animated.View style={[style, { transform: [{ scale: anim }] }]}>{children}</Animated.View>;
};

const HomeScreen: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [mode, setMode] = useState<GameMode>('classic');
  const [theme, setTheme] = useState<ThemeType>('cybercat');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [targetCount, setTargetCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [unlockedModes, setUnlockedModes] = useState<GameMode[]>(['classic']);
  const [catCoins, setCatCoins] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTheme = THEMES[theme];
  const config = getGridConfig(level);

  // 计时器
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameOverReason('时间到!');
      playLose();
      setGameState('result');
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, gameState]);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setLevel(0);
    setScore(0);
    setLives(3);
    setCorrectCount(0);
    playBGM(selectedMode);
    startLevel(0, selectedMode);
  };

  const startLevel = (lvl: number, gameMode: GameMode = mode) => {
    const cfg = getGridConfig(lvl);
    const total = cfg.gridSize * cfg.gridSize;
    const emojis = currentTheme.emoji;
    const target = emojis[Math.floor(Math.random() * emojis.length)];
    setTargetCount(cfg.targetCount);

    const targets = new Set<number>();
    while (targets.size < cfg.targetCount) targets.add(Math.floor(Math.random() * total));

    const newGrid: GridCell[] = [];
    for (let i = 0; i < total; i++) {
      const isTarget = targets.has(i);
      newGrid.push({
        id: i,
        emoji: isTarget ? target : emojis[Math.floor(Math.random() * emojis.length)],
        isTarget,
        isRevealed: true,
        isCorrect: null,
      });
    }
    setGrid(newGrid);
    setGameState('memorize');

    setTimeout(() => {
      setGrid(newGrid.map(c => ({ ...c, isRevealed: false })));
      setGameState('playing');
      setTimeLeft(6);
    }, cfg.showTime);
  };

  const handlePress = (idx: number) => {
    if (gameState !== 'playing') return;
    const cell = grid[idx];
    if (cell.isRevealed) return;

    const newGrid = [...grid];
    newGrid[idx] = { ...cell, isRevealed: true, isCorrect: cell.isTarget };
    setGrid(newGrid);

    const isTarget = cell.isTarget;
    const newScore = isTarget ? score + 10 : Math.max(0, score - 5);
    const newLives = isTarget ? lives : lives - 1;
    const newCorrect = isTarget ? correctCount + 1 : correctCount;

    if (isTarget) { setScore(newScore); setCorrectCount(newCorrect); playCorrect(); Vibration.vibrate(50); }
    else { setScore(newScore); setLives(newLives); playWrong(); Vibration.vibrate(150); }

    setTimeout(() => {
      if (newCorrect >= targetCount) {
        playWin();
        const nextLevel = level + 1;
        const newCoins = catCoins + 100 + Math.floor(nextLevel * 10);
        setCatCoins(newCoins);
        
        // 解锁新模式
        const newUnlocked = [...unlockedModes];
        Object.entries(MODE_CONFIG).forEach(([m, c]) => {
          if (nextLevel >= c.unlockLevel && !newUnlocked.includes(m as GameMode)) {
            newUnlocked.push(m as GameMode);
          }
        });
        setUnlockedModes(newUnlocked);
        
        setGameState('result');
        setGameOverReason('过关!');
        setTimeout(() => {
          setLevel(nextLevel);
          startLevel(nextLevel);
        }, 1500);
      } else if (newLives <= 0) {
        playLose();
        setGameOverReason('游戏结束');
        setGameState('result');
      }
    }, 100);
  };

  // 菜单
  const renderMenu = () => (
    <View style={[styles.container, { backgroundColor: currentTheme.bg[0] }]}>
      <Text style={styles.title}>🎮 指尖忆战</Text>
      <Text style={styles.subtitle}>记忆·反应·节奏</Text>
      
      <View style={styles.statsBar}>
        <Text style={styles.coinText}>🐱 猫币: {catCoins}</Text>
        <Text style={styles.levelText}>最高: {level}关</Text>
      </View>

      <View style={styles.themeSelect}>
        <Text style={styles.sectionTitle}>选择主题</Text>
        <View style={styles.themeRow}>
          {Object.entries(THEMES).map(([k, t]) => (
            <TouchableOpacity key={k} style={[styles.themeBtn, theme === k && { borderColor: currentTheme.highlight }]} onPress={() => setTheme(k as ThemeType)}>
              <Text style={styles.themeEmoji}>{t.emoji[0]}</Text>
              <Text style={styles.themeName}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.modeSection}>
        <Text style={styles.sectionTitle}>游戏模式</Text>
        {Object.entries(MODE_CONFIG).map(([m, c]) => {
          const unlocked = unlockedModes.includes(m as GameMode);
          return (
            <TouchableOpacity key={m} style={[styles.modeBtn, { backgroundColor: c.color }, !unlocked && styles.locked]} onPress={() => unlocked && startGame(m as GameMode)} disabled={!unlocked}>
              <Text style={styles.modeEmoji}>{unlocked ? c.emoji : '🔒'}</Text>
              <View style={styles.modeInfo}>
                <Text style={styles.modeName}>{c.name}</Text>
                <Text style={styles.modeDesc}>{unlocked ? c.desc : `通关${c.unlockLevel}关解锁`}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // 记忆/游戏
  const renderGame = () => {
    const isMemorize = gameState === 'memorize';
    const gridW = config.cellSize * config.gridSize + 10;
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.bg[0] }]}>
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.exitBtn} onPress={() => { stopBGM(); setGameState('menu'); }}>
            <Text style={styles.exitText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.gameTitle}>{MODE_CONFIG[mode].emoji} {MODE_CONFIG[mode].name}</Text>
          <Text style={styles.levelText}>第{level + 1}关</Text>
        </View>

        <View style={[styles.timerBox, { backgroundColor: timeLeft <= 3 ? COLORS.error : currentTheme.card }]}>
          <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statItem}>🏆 {score}</Text>
          <Text style={styles.statItem}>❤️ {lives}</Text>
          <Text style={styles.statItem}>✅ {correctCount}/{targetCount}</Text>
        </View>

        <View style={[styles.grid, { width: gridW, height: gridW }]}>
          {grid.map((cell, idx) => (
            isMemorize && cell.isTarget ? (
              <AnimatedCell key={idx} pulse style={[styles.cell, { backgroundColor: currentTheme.highlight }]}>
                <Text style={styles.cellEmoji}>{cell.emoji}</Text>
              </AnimatedCell>
            ) : (
              <TouchableOpacity key={idx} style={[styles.cell, { backgroundColor: cell.isRevealed ? (cell.isCorrect ? COLORS.success : COLORS.error) : currentTheme.card }]} onPress={() => handlePress(idx)} disabled={cell.isRevealed}>
                {cell.isRevealed && <Text style={styles.cellEmoji}>{cell.emoji}</Text>}
              </TouchableOpacity>
            )
          ))}
        </View>

        {isMemorize && <View style={[styles.hint, { backgroundColor: currentTheme.card }]}><Text style={styles.hintText}>记住 ❤️ 位置!</Text></View>}
      </View>
    );
  };

  // 结果
  const renderResult = () => (
    <View style={[styles.container, { backgroundColor: currentTheme.bg[0] }]}>
      <Text style={styles.resultEmoji}>{gameOverReason === '过关!' ? '🎉' : '😢'}</Text>
      <Text style={styles.resultTitle}>{gameOverReason}</Text>
      
      <View style={[styles.resultCard, { backgroundColor: currentTheme.card }]}>
        <View style={styles.resultRow}><Text style={styles.resultLabel}>得分</Text><Text style={styles.resultValue}>{score}</Text></View>
        <View style={styles.resultRow}><Text style={styles.resultLabel}>关卡</Text><Text style={styles.resultValue}>{level + 1}</Text></View>
        <View style={styles.resultRow}><Text style={styles.resultLabel}>猫币</Text><Text style={styles.resultValue}>+{100 + level * 10}</Text></View>
      </View>

      <TouchableOpacity style={[styles.retryBtn, { backgroundColor: currentTheme.highlight }]} onPress={() => startGame(mode)}>
        <Text style={styles.retryText}>再来一局</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: currentTheme.card }]} onPress={() => { stopBGM(); setGameState('menu'); }}>
        <Text style={styles.backText}>返回菜单</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {gameState === 'menu' && renderMenu()}
      {(gameState === 'memorize' || gameState === 'playing') && renderGame()}
      {gameState === 'result' && renderResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 50 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 20 },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 20 },
  coinText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  levelText: { color: '#fff', fontSize: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, marginBottom: 10, textAlign: 'center' },
  themeSelect: { marginBottom: 20 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  themeBtn: { alignItems: 'center', padding: 10, margin: 5, borderRadius: 10, borderWidth: 2, borderColor: 'transparent', width: 80 },
  themeEmoji: { fontSize: 28 },
  themeName: { fontSize: 10, color: '#aaa', marginTop: 4 },
  modeSection: { width: '100%' },
  modeBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, marginVertical: 6, borderRadius: 12 },
  modeInfo: { marginLeft: 12 },
  modeEmoji: { fontSize: 28 },
  modeName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modeDesc: { color: '#aaa', fontSize: 12 },
  locked: { opacity: 0.5 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 40, marginBottom: 10 },
  exitBtn: { padding: 10 },
  exitText: { color: '#fff', fontSize: 20 },
  gameTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  timerBox: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 10 },
  timerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginBottom: 15 },
  statItem: { color: '#fff', fontSize: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  cell: { justifyContent: 'center', alignItems: 'center', margin: 3, borderRadius: 8 },
  cellEmoji: { fontSize: 28 },
  hint: { marginTop: 20, padding: 15, borderRadius: 10 },
  hintText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultEmoji: { fontSize: 80, marginTop: 80 },
  resultTitle: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 30 },
  resultCard: { padding: 20, borderRadius: 15, width: '85%', marginBottom: 30 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  resultLabel: { color: '#aaa', fontSize: 16 },
  resultValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  retryBtn: { paddingVertical: 15, paddingHorizontal: 50, borderRadius: 25, marginBottom: 15 },
  retryText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20 },
  backText: { color: '#aaa', fontSize: 16 },
});

export default HomeScreen;
