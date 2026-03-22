import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getWords } from '../../utils/api';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');
const GRID_SIZE = 8;
const CELL_SIZE = Math.floor((width - 60) / GRID_SIZE);

interface WordPlacement {
  word: string;
  hint: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
  number: number;
}

export default function CrosswordScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [grid, setGrid] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<WordPlacement[]>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const level = user?.current_level || 'lkg-1st';
      const wordsData = await getWords(level);
      
      // Select 5-6 words for crossword
      const shuffled = wordsData.sort(() => Math.random() - 0.5);
      const selectedWords = shuffled.slice(0, 5).map((w: any) => ({
        word: w.word_english.toUpperCase(),
        hint: w.meaning
      }));
      
      generateCrossword(selectedWords);
    } catch (error) {
      console.error('Error loading words:', error);
      Alert.alert('Error', 'Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const generateCrossword = (wordList: {word: string, hint: string}[]) => {
    // Initialize empty grid
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const newUserGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const placements: WordPlacement[] = [];
    
    // Sort words by length (longest first)
    const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);
    
    let wordNumber = 1;
    
    for (const wordObj of sortedWords) {
      const word = wordObj.word.replace(/\s/g, '');
      if (word.length > GRID_SIZE) continue;
      
      let placed = false;
      
      // Try to place word
      for (let attempts = 0; attempts < 100 && !placed; attempts++) {
        const direction = Math.random() > 0.5 ? 'across' : 'down';
        const maxStart = GRID_SIZE - word.length;
        
        let startRow, startCol;
        if (direction === 'across') {
          startRow = Math.floor(Math.random() * GRID_SIZE);
          startCol = Math.floor(Math.random() * (maxStart + 1));
        } else {
          startRow = Math.floor(Math.random() * (maxStart + 1));
          startCol = Math.floor(Math.random() * GRID_SIZE);
        }
        
        // Check if word fits
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = direction === 'across' ? startRow : startRow + i;
          const c = direction === 'across' ? startCol + i : startCol;
          
          if (newGrid[r][c] !== '' && newGrid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          // Place word
          for (let i = 0; i < word.length; i++) {
            const r = direction === 'across' ? startRow : startRow + i;
            const c = direction === 'across' ? startCol + i : startCol;
            newGrid[r][c] = word[i];
          }
          
          placements.push({
            word,
            hint: wordObj.hint,
            startRow,
            startCol,
            direction,
            number: wordNumber++
          });
          placed = true;
        }
      }
    }
    
    setGrid(newGrid);
    setUserGrid(newUserGrid);
    setWords(placements);
  };

  const handleCellPress = (row: number, col: number) => {
    if (grid[row][col] !== '') {
      setSelectedCell({ row, col });
    }
  };

  const handleInput = (text: string) => {
    if (!selectedCell || text.length > 1) return;
    
    const { row, col } = selectedCell;
    const newUserGrid = [...userGrid.map(r => [...r])];
    newUserGrid[row][col] = text.toUpperCase();
    setUserGrid(newUserGrid);
    
    // Check if correct
    if (text.toUpperCase() === grid[row][col]) {
      setScore(prev => prev + 10);
    }
    
    // Check completion
    checkCompletion(newUserGrid);
  };

  const checkCompletion = (currentGrid: string[][]) => {
    let allCorrect = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] !== '' && currentGrid[r][c] !== grid[r][c]) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }
    
    if (allCorrect && words.length > 0) {
      setCompleted(true);
      Alert.alert(
        'Congratulations! 🎉',
        `You completed the crossword!\nScore: ${score + 50} stars`,
        [{ text: 'Play Again', onPress: () => loadWords() }]
      );
    }
  };

  const renderCell = (row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isEmpty = grid[row][col] === '';
    const isCorrect = userGrid[row][col] === grid[row][col] && userGrid[row][col] !== '';
    
    // Find if this is a word start
    const wordStart = words.find(w => w.startRow === row && w.startCol === col);
    
    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          isEmpty && styles.emptyCell,
          isSelected && styles.selectedCell,
          isCorrect && styles.correctCell,
        ]}
        onPress={() => handleCellPress(row, col)}
        disabled={isEmpty}
      >
        {wordStart && (
          <Text style={styles.cellNumber}>{wordStart.number}</Text>
        )}
        <Text style={[styles.cellText, isCorrect && styles.correctText]}>
          {userGrid[row][col] || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading crossword...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crossword Puzzle</Text>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Grid */}
        <View style={styles.gridContainer}>
          {Array(GRID_SIZE).fill(null).map((_, row) => (
            <View key={row} style={styles.row}>
              {Array(GRID_SIZE).fill(null).map((_, col) => renderCell(row, col))}
            </View>
          ))}
        </View>

        {/* Input */}
        {selectedCell && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              maxLength={1}
              autoCapitalize="characters"
              onChangeText={handleInput}
              placeholder="Type letter"
              autoFocus
            />
          </View>
        )}

        {/* Hints */}
        <View style={styles.hintsContainer}>
          <Text style={styles.hintsTitle}>Hints:</Text>
          
          <Text style={styles.hintDirection}>Across:</Text>
          {words.filter(w => w.direction === 'across').map(w => (
            <Text key={w.number} style={styles.hint}>
              {w.number}. {w.hint}
            </Text>
          ))}
          
          <Text style={styles.hintDirection}>Down:</Text>
          {words.filter(w => w.direction === 'down').map(w => (
            <Text key={w.number} style={styles.hint}>
              {w.number}. {w.hint}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  gridContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyCell: {
    backgroundColor: '#1F2937',
  },
  selectedCell: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  correctCell: {
    backgroundColor: '#D1FAE5',
  },
  cellNumber: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 8,
    color: '#666',
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  correctText: {
    color: '#059669',
  },
  inputContainer: {
    marginTop: 20,
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  hintsContainer: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  hintsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  hintDirection: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginTop: 8,
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    paddingLeft: 8,
  },
});
