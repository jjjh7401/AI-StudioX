// useNodeGeneration: AI 생성 실행 로직 훅 (SPEC-UI-001 M4)
// App.tsx의 onGenerateNode 로직을 훅으로 분리하여 상태 관리와 취소 기능 제공
// @MX:ANCHOR: App.tsx의 onGenerateNode와 executeGraph가 모두 이 훅을 경유함
// @MX:REASON: fan_in >= 3 (onGenerateNode, executeGraph, PlaygroundModal.onGenerateSingle)

import { useState, useCallback, useRef } from 'react';
import type { Node, Connection, NodeData, HistoryAsset } from '../types';

// ========================
// 타입 정의
// ========================

/** useNodeGeneration 훅 옵션 */
export interface UseNodeGenerationOptions {
  /** 현재 노드 맵 */
  nodes: Record<string, Node>;
  /** 현재 커넥션 목록 */
  connections: Connection[];
  /** 노드 데이터 업데이트 함수 */
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  /** 히스토리 추가 함수 */
  addToHistory: (asset: Omit<HistoryAsset, 'id'>) => void;
  /**
   * 실제 노드 실행 로직 (App.tsx에서 주입)
   * @MX:NOTE: executeNode는 App.tsx 내부의 복잡한 로직을 포함하므로
   *           직접 추출 대신 콜백 패턴으로 위임 (M4 첫 단계 전략)
   */
  executeNodeFn: (nodeId: string) => Promise<Partial<Node>>;
}

/** useNodeGeneration 훅 반환값 */
export interface UseNodeGenerationReturn {
  /** 단일 노드 생성 실행 */
  generateForNode: (nodeId: string) => Promise<void>;
  /** 노드 생성 취소 (generatingNodeIds에서 제거) */
  cancelGeneration: (nodeId: string) => void;
  /** 특정 노드가 생성 중인지 여부 */
  isGenerating: (nodeId: string) => boolean;
  /** 현재 생성 중인 노드 ID 집합 */
  generatingNodeIds: Set<string>;
}

// ========================
// 훅 구현
// ========================

/**
 * AI 노드 생성 상태 관리 훅
 * - generatingNodeIds: Set<string>으로 동시 다중 노드 생성 추적
 * - 생성 시작/완료/오류 시 자동 상태 업데이트
 * - cancelGeneration: 취소 시 즉시 상태에서 제거
 */
export function useNodeGeneration({
  nodes,
  connections,
  updateNodeData,
  addToHistory,
  executeNodeFn,
}: UseNodeGenerationOptions): UseNodeGenerationReturn {
  // 현재 생성 중인 노드 ID 집합
  const [generatingNodeIds, setGeneratingNodeIds] = useState<Set<string>>(
    () => new Set()
  );

  // 취소된 노드 ID 추적 (ref: 렌더 사이클 외부에서 확인)
  const cancelledRef = useRef<Set<string>>(new Set());

  /**
   * 노드를 generatingNodeIds에 추가
   */
  const addGenerating = useCallback((nodeId: string) => {
    setGeneratingNodeIds(prev => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
  }, []);

  /**
   * 노드를 generatingNodeIds에서 제거
   */
  const removeGenerating = useCallback((nodeId: string) => {
    setGeneratingNodeIds(prev => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

  /**
   * 단일 노드 생성 실행
   * - 바이패스되거나 존재하지 않는 노드는 건너뜀
   * - isLoading 상태를 시작/완료 시 토글
   * - 오류 발생 시 loadingMessage에 오류 내용 설정
   */
  const generateForNode = useCallback(
    async (nodeId: string): Promise<void> => {
      const node = nodes[nodeId];
      // 노드 없음 또는 바이패스 시 건너뜀
      if (!node || node.isBypassed) return;

      // 취소 플래그 초기화
      cancelledRef.current.delete(nodeId);

      // 생성 상태 시작
      addGenerating(nodeId);
      updateNodeData(nodeId, { isLoading: true } as Partial<NodeData>);

      try {
        // 실제 노드 실행은 App.tsx 콜백에 위임
        await executeNodeFn(nodeId);

        // 취소되지 않은 경우에만 완료 처리
        if (!cancelledRef.current.has(nodeId)) {
          updateNodeData(nodeId, { isLoading: false } as Partial<NodeData>);
        }
      } catch (error) {
        // 오류 발생 시 isLoading false + loadingMessage 오류 설정
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류';
        updateNodeData(nodeId, {
          isLoading: false,
          loadingMessage: `Error: ${errorMessage}`,
        } as Partial<NodeData>);
        console.error(`[useNodeGeneration] 노드 ${nodeId} 실행 오류:`, error);
      } finally {
        // 항상 generatingNodeIds에서 제거
        removeGenerating(nodeId);
      }
    },
    [nodes, addGenerating, removeGenerating, updateNodeData, executeNodeFn]
  );

  /**
   * 노드 생성 취소
   * - generatingNodeIds에서 즉시 제거
   * - 진행 중인 비동기 작업은 finally에서 정리됨
   */
  const cancelGeneration = useCallback(
    (nodeId: string): void => {
      cancelledRef.current.add(nodeId);
      removeGenerating(nodeId);
    },
    [removeGenerating]
  );

  /**
   * 특정 노드가 생성 중인지 확인
   */
  const isGenerating = useCallback(
    (nodeId: string): boolean => {
      return generatingNodeIds.has(nodeId);
    },
    [generatingNodeIds]
  );

  return {
    generateForNode,
    cancelGeneration,
    isGenerating,
    generatingNodeIds,
  };
}
