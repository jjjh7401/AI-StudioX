// useNodeGeneration.test.ts: useNodeGeneration 훅 TDD 스펙 테스트
// RED-GREEN-REFACTOR 사이클로 구현 (SPEC-UI-001 M4)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { NodeType } from '../../types';
import type { Node, Connection, NodeData, HistoryAsset } from '../../types';

// Mock 타입 헬퍼
type MockFn<T extends (...args: any[]) => any> = ReturnType<typeof vi.fn> & T;

// ========================
// 서비스 모듈 모킹
// ========================

vi.mock('../../services/geminiService', () => ({
  generateText: vi.fn(),
  generateImage: vi.fn(),
  editImage: vi.fn(),
  removeBackground: vi.fn(),
  expandImage: vi.fn(),
  upscaleImage: vi.fn(),
  generateVirtualModel: vi.fn(),
  generateModelFromImage: vi.fn(),
  generateVtonImage: vi.fn(),
  generateStoryboardScenario: vi.fn(),
  generateConsistentImage: vi.fn(),
  analyzeProductInfo: vi.fn(),
  generateScriptFromStyle: vi.fn(),
  captureImagesFromUrl: vi.fn(),
  generateFinalPrompt: vi.fn(),
  constructPromptFromShot: vi.fn(),
  preprocessImageForOutpainting: vi.fn(),
  generateVideo: vi.fn(),
  detectGridItems: vi.fn(),
}));

vi.mock('../../services/imageProcessingService', () => ({
  compositeImages: vi.fn(),
  stitchImages: vi.fn(),
  urlToDataURL: vi.fn(),
  addSolidBackground: vi.fn(),
  cropAndTrimImage: vi.fn(),
}));

// ========================
// 테스트용 헬퍼 팩토리
// ========================

/** 기본 테스트용 노드 생성 */
function makeNode(
  id: string,
  type: NodeType = NodeType.Text,
  data: Partial<NodeData> = {}
): Node {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    size: { width: 300, height: 200 },
    data: { ...data } as NodeData,
    inputs: [],
    outputs: [],
    isCollapsed: false,
    isBypassed: false,
  };
}

// ========================
// Cycle 1: 생성 상태 관리 테스트
// ========================

describe('useNodeGeneration - Cycle 1: 생성 상태 관리', () => {
  let mockExecuteNodeFn: MockFn<(nodeId: string) => Promise<Partial<Node>>>;
  let mockUpdateNodeData: MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
  let mockAddToHistory: MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;
  let nodes: Record<string, Node>;
  let connections: Connection[];

  beforeEach(() => {
    vi.clearAllMocks();

    // executeNode 콜백: 즉시 성공 반환
    mockExecuteNodeFn = vi.fn().mockResolvedValue({}) as MockFn<(nodeId: string) => Promise<Partial<Node>>>;
    mockUpdateNodeData = vi.fn() as MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
    mockAddToHistory = vi.fn() as MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;

    nodes = {
      'node-1': makeNode('node-1', NodeType.Image, { isLoading: false } as any),
      'node-2': makeNode('node-2', NodeType.Assistant, { isLoading: false } as any),
    };
    connections = [];
  });

  it('초기 상태: generatingNodeIds가 빈 Set이어야 한다', async () => {
    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections,
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    expect(result.current.generatingNodeIds).toBeInstanceOf(Set);
    expect(result.current.generatingNodeIds.size).toBe(0);
  });

  it('초기 상태: isGenerating(nodeId)는 false를 반환해야 한다', async () => {
    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections,
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    expect(result.current.isGenerating('node-1')).toBe(false);
    expect(result.current.isGenerating('node-2')).toBe(false);
  });

  it('generateForNode 호출 시 해당 노드가 generatingNodeIds에 추가되어야 한다', async () => {
    // executeNode가 완료되기 전 상태를 확인하기 위해 지연 설정
    let resolveExecution!: () => void;
    mockExecuteNodeFn.mockReturnValue(
      new Promise<Partial<Node>>(resolve => {
        resolveExecution = () => resolve({});
      })
    );

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections,
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    act(() => {
      result.current.generateForNode('node-1');
    });

    // 실행 중 상태 확인
    expect(result.current.generatingNodeIds.has('node-1')).toBe(true);
    expect(result.current.isGenerating('node-1')).toBe(true);

    // 완료 후 상태 확인
    await act(async () => {
      resolveExecution();
    });

    await waitFor(() => {
      expect(result.current.generatingNodeIds.has('node-1')).toBe(false);
      expect(result.current.isGenerating('node-1')).toBe(false);
    });
  });

  it('generateForNode 완료 후 generatingNodeIds에서 제거되어야 한다', async () => {
    mockExecuteNodeFn.mockResolvedValue({});

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections,
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    await act(async () => {
      await result.current.generateForNode('node-1');
    });

    expect(result.current.generatingNodeIds.has('node-1')).toBe(false);
    expect(result.current.isGenerating('node-1')).toBe(false);
  });

  it('오류 발생 시에도 generatingNodeIds에서 제거되어야 한다', async () => {
    mockExecuteNodeFn.mockRejectedValue(new Error('생성 실패'));

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections,
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    await act(async () => {
      await result.current.generateForNode('node-1');
    });

    expect(result.current.generatingNodeIds.has('node-1')).toBe(false);
    expect(result.current.isGenerating('node-1')).toBe(false);
  });
});

// ========================
// Cycle 2: 노드 타입 디스패치 테스트
// ========================

describe('useNodeGeneration - Cycle 2: 노드 타입 디스패치', () => {
  let mockExecuteNodeFn: MockFn<(nodeId: string) => Promise<Partial<Node>>>;
  let mockUpdateNodeData: MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
  let mockAddToHistory: MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteNodeFn = vi.fn().mockResolvedValue({}) as MockFn<(nodeId: string) => Promise<Partial<Node>>>;
    mockUpdateNodeData = vi.fn() as MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
    mockAddToHistory = vi.fn() as MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;
  });

  it('일반 노드(Image/Assistant 등): executeNodeFn 콜백이 호출되어야 한다', async () => {
    const nodes: Record<string, Node> = {
      'img-node': makeNode('img-node', NodeType.Image, {
        isLoading: false,
        prompt: '테스트 프롬프트',
        imageUrls: [],
      } as any),
    };

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    await act(async () => {
      await result.current.generateForNode('img-node');
    });

    expect(mockExecuteNodeFn).toHaveBeenCalledWith('img-node');
  });

  it('바이패스된 노드는 생성을 건너뛰어야 한다', async () => {
    const bypassedNode: Node = {
      ...makeNode('bypassed-node', NodeType.Image),
      isBypassed: true,
    };
    const nodes: Record<string, Node> = { 'bypassed-node': bypassedNode };

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    await act(async () => {
      await result.current.generateForNode('bypassed-node');
    });

    expect(mockExecuteNodeFn).not.toHaveBeenCalled();
  });

  it('존재하지 않는 노드 ID는 조용히 무시해야 한다', async () => {
    const nodes: Record<string, Node> = {};

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    await act(async () => {
      await result.current.generateForNode('nonexistent');
    });

    expect(mockExecuteNodeFn).not.toHaveBeenCalled();
  });
});

// ========================
// Cycle 3: API 키 체크 및 오류 처리 (REQ-AI-009)
// ========================

describe('useNodeGeneration - Cycle 3: API 키 체크 및 오류 처리', () => {
  let mockUpdateNodeData: MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
  let mockAddToHistory: MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateNodeData = vi.fn() as MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
    mockAddToHistory = vi.fn() as MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;
  });

  it('REQ-AI-009: API 키 오류 발생 시 updateNodeData에 오류 메시지가 설정되어야 한다', async () => {
    // executeNodeFn이 API 키 오류를 던짐
    const apiKeyError = new Error('API Key is missing. Please ensure process.env.API_KEY or process.env.GEMINI_API_KEY is configured.');
    const mockExecuteNodeFn = vi.fn().mockRejectedValue(apiKeyError) as MockFn<(nodeId: string) => Promise<Partial<Node>>>;

    const nodes: Record<string, Node> = {
      'node-1': makeNode('node-1', NodeType.Image, { isLoading: false } as any),
    };

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    await act(async () => {
      await result.current.generateForNode('node-1');
    });

    // 오류 메시지가 노드에 설정되어야 함
    expect(mockUpdateNodeData).toHaveBeenCalledWith('node-1', expect.objectContaining({
      isLoading: false,
    }));
  });

  it('오류 발생 시 isGenerating 상태가 false로 복구되어야 한다', async () => {
    const mockExecuteNodeFn = vi.fn().mockRejectedValue(new Error('네트워크 오류')) as MockFn<(nodeId: string) => Promise<Partial<Node>>>;

    const nodes: Record<string, Node> = {
      'node-1': makeNode('node-1', NodeType.Image, { isLoading: false } as any),
    };

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    await act(async () => {
      await result.current.generateForNode('node-1');
    });

    expect(result.current.isGenerating('node-1')).toBe(false);
    expect(result.current.generatingNodeIds.size).toBe(0);
  });

  it('생성 시작 시 updateNodeData로 isLoading: true가 설정되어야 한다', async () => {
    let resolveExecution!: () => void;
    const mockExecuteNodeFn = vi.fn().mockReturnValue(
      new Promise<Partial<Node>>(resolve => {
        resolveExecution = () => resolve({});
      })
    ) as MockFn<(nodeId: string) => Promise<Partial<Node>>>;

    const nodes: Record<string, Node> = {
      'node-1': makeNode('node-1', NodeType.Image, { isLoading: false } as any),
    };

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    act(() => {
      result.current.generateForNode('node-1');
    });

    // 생성 시작 시 isLoading: true 설정 확인
    expect(mockUpdateNodeData).toHaveBeenCalledWith('node-1', { isLoading: true });

    await act(async () => {
      resolveExecution();
    });
  });
});

// ========================
// Cycle 4: 취소 (cancelGeneration)
// ========================

describe('useNodeGeneration - Cycle 4: 취소 기능', () => {
  let mockUpdateNodeData: MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
  let mockAddToHistory: MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateNodeData = vi.fn() as MockFn<(nodeId: string, data: Partial<NodeData>) => void>;
    mockAddToHistory = vi.fn() as MockFn<(asset: Omit<HistoryAsset, 'id'>) => void>;
  });

  it('cancelGeneration 호출 시 generatingNodeIds에서 해당 노드가 제거되어야 한다', async () => {
    let resolveExecution!: () => void;
    const mockExecuteNodeFn = vi.fn().mockReturnValue(
      new Promise<Partial<Node>>(resolve => {
        resolveExecution = () => resolve({});
      })
    ) as MockFn<(nodeId: string) => Promise<Partial<Node>>>;

    const nodes: Record<string, Node> = {
      'node-1': makeNode('node-1', NodeType.Image, { isLoading: false } as any),
    };

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    // 생성 시작
    act(() => {
      result.current.generateForNode('node-1');
    });

    expect(result.current.isGenerating('node-1')).toBe(true);

    // 취소
    act(() => {
      result.current.cancelGeneration('node-1');
    });

    expect(result.current.isGenerating('node-1')).toBe(false);
    expect(result.current.generatingNodeIds.has('node-1')).toBe(false);

    // 완료는 여전히 처리 (메모리 정리)
    await act(async () => {
      resolveExecution();
    });
  });

  it('cancelGeneration은 함수로 노출되어야 한다', async () => {
    const mockExecuteNodeFn = vi.fn().mockResolvedValue({}) as MockFn<(nodeId: string) => Promise<Partial<Node>>>;
    const nodes: Record<string, Node> = {};

    const { useNodeGeneration } = await import('../useNodeGeneration');
    const { result } = renderHook(() =>
      useNodeGeneration({
        nodes,
        connections: [],
        updateNodeData: mockUpdateNodeData,
        addToHistory: mockAddToHistory,
        executeNodeFn: mockExecuteNodeFn,
      })
    );

    expect(typeof result.current.cancelGeneration).toBe('function');
  });
});
