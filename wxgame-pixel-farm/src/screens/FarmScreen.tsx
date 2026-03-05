import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Image } from 'react-native';
import { COLORS, Season, SEASONS, CROPS, CropType, ANIMALS, AnimalType, TOOLS, ToolType, Plot, Animal, Plot as PlotType, TerrainType } from '../constants';

// 复古8位音效
const playSound = (type: 'coin' | 'jump' | 'powerup' | 'hurt' | 'win' | 'select') => {
  const sounds: Record<string, number[]> = {
    coin: [987, 1318, 263],
    jump: [200, 400, 100],
    powerup: [523, 659, 784, 1047],
    hurt: [150, 100, 200],
    win: [523, 659, 784, 1047, 1318],
    select: [440, 0],
  };
  
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = sounds[type];
    notes.forEach((freq, i) => {
      if (freq === 0) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.1);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.1);
    });
  } catch (e) {}
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_SIZE = 4;
const CELL_SIZE = Math.min((SCREEN_WIDTH - 40) / GRID_SIZE, 80);

// 像素方块组件
const PixelBlock: React.FC<{ children: React.ReactNode; style?: any; pulse?: boolean }> = ({ children, style, pulse }) => {
  const anim = React.useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (pulse) {
      const p = Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]));
      p.start();
      return () => p.stop();
    }
  }, [pulse]);
  
  return (
    <Animated.View style={[styles.pixelBlock, style, pulse && { transform: [{ scale: anim }] }]}>
      {children}
    </Animated.View>
  );
};

// 像素文字
const PixelText: React.FC<{ children: React.ReactNode; size?: 'small' | 'medium' | 'large'; color?: string }> = ({ 
  children, size = 'medium', color = COLORS.text 
}) => (
  <Text style={[
    styles.pixelText, 
    { fontSize: size === 'large' ? 24 : size === 'medium' ? 16 : 12, color }
  ]}>
    {children}
  </Text>
);

// 初始化地图
const initPlots = (): PlotType[] => 
  Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    id: i,
    terrain: 'grass' as TerrainType,
    crop: null,
    growthDay: 0,
    watered: false,
    hasItem: Math.random() > 0.9, // 随机物品
  }));

const FarmScreen: React.FC = () => {
  const [gold, setGold] = useState(500);
  const [day, setDay] = useState(1);
  const [season, setSeason] = useState<Season>('spring');
  const [tool, setTool] = useState<ToolType>('hoe');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('carrot');
  const [plots, setPlots] = useState<PlotType[]>(initPlots());
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [view, setView] = useState<'farm' | 'shop' | 'animals'>('farm');
  const [message, setMessage] = useState('欢迎来到像素农场! 🚜');
  const [showMessage, setShowMessage] = useState(false);
  
  const seasonData = SEASONS[season];

  // 显示消息
  const showMsg = (msg: string) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  // 地块点击
  const handlePlotPress = (plot: PlotType) => {
    playSound('select');
    const newPlots = [...plots];
    const idx = newPlots.indexOf(plot);
    
    if (tool === 'hoe') {
      // 锄地/种植
      if (plot.terrain === 'grass' && !plot.crop) {
        newPlots[idx] = { ...plot, terrain: 'soil', crop: selectedCrop, growthDay: 0, watered: true };
        setPlots(newPlots);
        setGold(g => g - CROPS[selectedCrop].seedPrice);
        showMsg(`种下了 ${CROPS[selectedCrop].name}! 🌱`);
      }
    } else if (tool === 'water') {
      // 浇水
      if (plot.crop && !plot.watered) {
        newPlots[idx] = { ...plot, watered: true };
        setPlots(newPlots);
        showMsg('浇水啦! 💧');
      }
    } else if (tool === 'harvest') {
      // 收获
      if (plot.crop) {
        const cropData = CROPS[plot.crop];
        const seasonBonus = SEASONS[season].cropBonus;
        const earnings = Math.floor(cropData.sellPrice * seasonBonus);
        newPlots[idx] = { ...plot, crop: null, growthDay: 0, watered: false };
        setPlots(newPlots);
        setGold(g => g + earnings);
        showMsg(`收获 ${cropData.name}! +${earnings}💰`);
        playSound('coin');
      }
    } else if (tool === 'sickle') {
      // 清理
      if (plot.terrain === 'soil' && !plot.crop) {
        newPlots[idx] = { ...plot, terrain: 'grass' };
        setPlots(newPlots);
      }
    }
  };

  // 睡觉 - 新一天
  const sleep = () => {
    playSound('select');
    
    // 作物生长
    const newPlots = plots.map(plot => {
      if (!plot.crop) return plot;
      const cropData = CROPS[plot.crop];
      const newGrowth = plot.watered ? plot.growthDay + 1 : plot.growthDay;
      return { ...plot, growthDay: newGrowth, watered: false };
    });
    setPlots(newPlots);
    
    // 动物产品
    let animalIncome = 0;
    const newAnimals = animals.map(a => {
      if (a.fed && a.productReady) {
        animalIncome += ANIMALS[a.type].productPrice;
      }
      return { ...a, fed: false, productReady: true };
    });
    setAnimals(newAnimals);
    setGold(g => g + animalIncome);
    
    // 新一天
    const newDay = day + 1;
    setDay(newDay);
    
    // 季节变化 (每28天)
    if (newDay % 28 === 0) {
      const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
      const idx = seasons.indexOf(season);
      setSeason(seasons[(idx + 1) % 4]);
      showMsg(`现在是${SEASONS[seasons[(idx + 1) % 4]].name}季! ❄️`);
    } else {
      showMsg(`第${newDay}天开始了! ☀️`);
    }
  };

  // 收集动物产品
  const collectProducts = () => {
    let total = 0;
    const newAnimals = animals.map(a => {
      if (a.productReady) {
        total += ANIMALS[a.type].productPrice;
        return { ...a, productReady: false };
      }
      return a;
    });
    setAnimals(newAnimals);
    setGold(g => g + total);
    if (total > 0) {
      setGold(g => g + total);
      showMsg(`收集到产品! +${total}💰`);
      playSound('coin');
    }
  };

  // 购买动物
  const buyAnimal = (type: AnimalType) => {
    const animalData = ANIMALS[type];
    if (gold >= animalData.price) {
      setGold(g => g - animalData.price);
      setAnimals([...animals, {
        id: Date.now(),
        type,
        name: animalData.name,
        fed: false,
        productReady: true,
      }]);
      showMsg(`买了 ${animalData.name}! 🐄`);
      playSound('powerup');
    } else {
      showMsg('金币不够! 💸');
      playSound('hurt');
    }
  };

  // 渲染顶部状态栏 (复古风格)
  const renderStatusBar = () => (
    <View style={styles.statusBar}>
      <PixelBlock style={styles.statusItem}>
        <Text style={styles.statusEmoji}>📅</Text>
        <PixelText size="small">Day {day}</PixelText>
      </PixelBlock>
      <PixelBlock style={styles.statusItem}>
        <Text style={styles.statusEmoji}>💰</Text>
        <PixelText size="small" color={COLORS.coin}>{gold}</PixelText>
      </PixelBlock>
      <PixelBlock style={styles.statusItem}>
        <Text style={styles.statusEmoji}>{SEASONS[season].name}</Text>
        <PixelText size="small">{SEASONS[season].bg === '#98D98E' ? '🌸' : SEASONS[season].bg === '#F8D878' ? '☀️' : SEASONS[season].bg === '#D8A048' ? '🍂' : '❄️'}</PixelText>
      </PixelBlock>
    </View>
  );

  // 渲染工具栏
  const renderToolbar = () => (
    <View style={styles.toolbar}>
      {Object.entries(TOOLS).map(([key, t]) => (
        <TouchableOpacity 
          key={key} 
          style={[styles.toolBtn, tool === key && styles.toolBtnActive]}
          onPress={() => { setTool(key as ToolType); playSound('select'); }}
        >
          <Text style={styles.toolSprite}>{t.sprite}</Text>
          <Text style={styles.toolKey}>[{t.key}]</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 渲染农场
  const renderFarm = () => (
    <View style={styles.farmContainer}>
      <PixelText size="large">🏡 MY FARM</PixelText>
      <View style={styles.grid}>
        {plots.map((plot, idx) => {
          const cropData = plot.crop ? CROPS[plot.crop] : null;
          const growthPercent = cropData ? Math.min(plot.growthDay / cropData.daysToGrow, 1) : 0;
          
          return (
            <TouchableOpacity 
              key={plot.id} 
              style={[
                styles.plot,
                { backgroundColor: plot.terrain === 'soil' ? COLORS.ground : COLORS.grass }
              ]}
              onPress={() => handlePlotPress(plot)}
            >
              {plot.crop && (
                <>
                  <Text style={styles.cropSprite}>
                    {growthPercent === 0 ? '🟤' : growthPercent < 0.5 ? '🌱' : growthPercent < 1 ? '🌿' : cropData?.sprite}
                  </Text>
                  {plot.watered && <Text style={styles.waterIcon}>💧</Text>}
                </>
              )}
              {plot.hasItem && !plot.crop && <Text style={styles.itemIcon}>🍄</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // 渲染商店
  const renderShop = () => (
    <View style={styles.shopContainer}>
      <PixelText size="large">🛒 SHOP</PixelText>
      <PixelText size="small" color={COLORS.coin}>💰 Gold: {gold}</PixelText>
      
      <PixelText size="medium" style={styles.shopTitle}>🌱 SEEDS</PixelText>
      <View style={styles.shopGrid}>
        {Object.entries(CROPS).map(([key, crop]) => (
          <TouchableOpacity 
            key={key}
            style={[styles.shopItem, selectedCrop === key && styles.shopItemActive]}
            onPress={() => { setSelectedCrop(key as CropType); playSound('select'); }}
          >
            <Text style={styles.shopSprite}>{crop.sprite}</Text>
            <PixelText size="small">{crop.name}</PixelText>
            <PixelText size="small" color={COLORS.coin}>{crop.seedPrice}💰</PixelText>
          </TouchableOpacity>
        ))}
      </View>

      <PixelText size="medium" style={styles.shopTitle}>🐄 ANIMALS</PixelText>
      <View style={styles.shopGrid}>
        {Object.entries(ANIMALS).map(([key, animal]) => (
          <TouchableOpacity 
            key={key}
            style={styles.shopItem}
            onPress={() => buyAnimal(key as AnimalType)}
          >
            <Text style={styles.shopSprite}>{animal.sprite}</Text>
            <PixelText size="small">{animal.name}</PixelText>
            <PixelText size="small" color={COLORS.coin}>{animal.price}💰</PixelText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // 渲染动物栏
  const renderAnimals = () => (
    <View style={styles.animalsContainer}>
      <PixelText size="large">🐾 BARN</PixelText>
      
      {animals.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏚️</Text>
          <PixelText>还没有动物</PixelText>
          <PixelText size="small">去商店买一只吧!</PixelText>
        </View>
      )}

      <View style={styles.animalsGrid}>
        {animals.map(animal => (
          <PixelBlock key={animal.id} style={styles.animalCard}>
            <Text style={styles.animalSprite}>{ANIMALS[animal.type].sprite}</Text>
            <PixelText size="small">{animal.name}</PixelText>
            <View style={styles.animalStatus}>
              {!animal.fed && (
                <TouchableOpacity 
                  style={styles.feedBtn}
                  onPress={() => {
                    setAnimals(animals.map(a => a.id === animal.id ? { ...a, fed: true } : a));
                    playSound('select');
                  }}
                >
                  <PixelText size="small">喂食</PixelText>
                </TouchableOpacity>
              )}
              {animal.productReady && (
                <PixelText size="small" color={COLORS.coin}>✓</PixelText>
              )}
            </View>
          </PixelBlock>
        ))}
      </View>
    </View>
  );

  // 渲染底部导航
  const renderNav = () => (
    <View style={styles.navBar}>
      <TouchableOpacity 
        style={[styles.navBtn, view === 'farm' && styles.navBtnActive]}
        onPress={() => { setView('farm'); playSound('select'); }}
      >
        <Text style={styles.navEmoji}>🏡</Text>
        <PixelText size="small">农场</PixelText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.navBtn, view === 'shop' && styles.navBtnActive]}
        onPress={() => { setView('shop'); playSound('select'); }}
      >
        <Text style={styles.navEmoji}>🛒</Text>
        <PixelText size="small">商店</PixelText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.navBtn, view === 'animals' && styles.navBtnActive]}
        onPress={() => { setView('animals'); playSound('select'); }}
      >
        <Text style={styles.navEmoji}>🐄</Text>
        <PixelText size="small">谷仓</PixelText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderStatusBar()}
      {renderToolbar()}
      
      <ScrollView style={styles.content}>
        {view === 'farm' && renderFarm()}
        {view === 'shop' && renderShop()}
        {view === 'animals' && renderAnimals()}
      </ScrollView>

      {/* 消息提示 */}
      {showMessage && (
        <View style={styles.messageBox}>
          <PixelText>{message}</PixelText>
        </View>
      )}

      {/* 底部操作 */}
      <View style={styles.bottomBar}>
        {animals.length > 0 && (
          <TouchableOpacity style={styles.actionBtn} onPress={collectProducts}>
            <Text style={styles.actionEmoji}>📦</Text>
            <PixelText size="small">收集</PixelText>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.sleepBtn]} onPress={sleep}>
          <Text style={styles.actionEmoji}>🛏️</Text>
          <PixelText size="small">睡觉</PixelText>
        </TouchableOpacity>
      </View>

      {renderNav()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.uiBg,
  },
  // 状态栏
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: COLORS.sky,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.uiBorder,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 2,
    borderColor: COLORS.uiBorder,
  },
  statusEmoji: { fontSize: 20, marginRight: 5 },
  
  // 像素文字
  pixelText: {
    color: COLORS.text,
    fontFamily: 'monospace',
    textShadowColor: COLORS.textShadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  // 像素方块
  pixelBlock: {
    borderWidth: 2,
    borderColor: COLORS.uiBorder,
  },
  
  // 工具栏
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#222',
  },
  toolBtn: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#555',
  },
  toolBtnActive: {
    backgroundColor: COLORS.grass,
    borderColor: COLORS.uiBorder,
  },
  toolSprite: { fontSize: 24 },
  toolKey: { fontSize: 10, color: '#888', marginTop: 2 },
  
  // 内容区
  content: {
    flex: 1,
  },
  
  // 农场
  farmContainer: {
    alignItems: 'center',
    padding: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
    backgroundColor: COLORS.grass,
    padding: 10,
    borderWidth: 4,
    borderColor: COLORS.uiBorder,
  },
  plot: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  cropSprite: { fontSize: 30 },
  waterIcon: { position: 'absolute', top: 2, right: 2, fontSize: 12 },
  itemIcon: { position: 'absolute', fontSize: 14 },
  
  // 商店
  shopContainer: { padding: 15 },
  shopTitle: { marginTop: 15, marginBottom: 10, color: COLORS.grass },
  shopGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  shopItem: {
    width: '30%',
    backgroundColor: '#333',
    padding: 10,
    margin: '1.5%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  shopItemActive: { borderColor: COLORS.grass, backgroundColor: '#444' },
  shopSprite: { fontSize: 28 },
  
  // 动物栏
  animalsContainer: { padding: 15 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyEmoji: { fontSize: 50 },
  animalsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15 },
  animalCard: {
    width: '45%',
    backgroundColor: '#333',
    padding: 15,
    margin: '2.5%',
    alignItems: 'center',
  },
  animalSprite: { fontSize: 35 },
  animalStatus: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  feedBtn: { backgroundColor: COLORS.grass, paddingHorizontal: 10, paddingVertical: 4 },
  
  // 导航
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderTopWidth: 4,
    borderTopColor: COLORS.uiBorder,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  navBtnActive: { backgroundColor: COLORS.grass },
  navEmoji: { fontSize: 24 },
  
  // 底部操作
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#1a1a1a',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grass,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: COLORS.uiBorder,
  },
  sleepBtn: { backgroundColor: COLORS.sky },
  actionEmoji: { fontSize: 20, marginRight: 5 },
  
  // 消息框
  messageBox: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 15,
    borderWidth: 4,
    borderColor: COLORS.uiBorder,
    alignItems: 'center',
  },
});

export default FarmScreen;
