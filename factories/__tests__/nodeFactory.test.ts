// nodeFactory.test.ts: 노드 팩토리 TDD 테스트 (28개 NodeType 전체 커버)
import { describe, it, expect } from 'vitest';
import { NodeType, ConnectorType } from '../../types';
import { createNode } from '../nodeFactory';

describe('createNode - 기본 속성', () => {
  it('id가 올바르게 설정되어야 한다', () => {
    const node = createNode(NodeType.Text, 'test-id', { x: 0, y: 0 });
    expect(node.id).toBe('test-id');
  });

  it('type이 올바르게 설정되어야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 0, y: 0 });
    expect(node.type).toBe(NodeType.Text);
  });

  it('position이 올바르게 설정되어야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 100, y: 200 });
    expect(node.position.x).toBe(100);
    expect(node.position.y).toBe(200);
  });

  it('isBypassed가 기본값 false여야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 0, y: 0 });
    expect(node.isBypassed).toBe(false);
  });

  it('isCollapsed가 기본값 false여야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 0, y: 0 });
    expect(node.isCollapsed).toBe(false);
  });

  it('size가 정의되어야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 0, y: 0 });
    expect(node.size.width).toBeGreaterThan(0);
    expect(node.size.height).toBeGreaterThan(0);
  });
});

describe('createNode - Text 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 350, height: 250 });
  });

  it('입력 커넥터가 없어야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 0, y: 0 });
    expect(node.inputs).toHaveLength(0);
  });

  it('Text 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.Text, 'id', { x: 0, y: 0 });
    expect(node.outputs).toHaveLength(1);
    expect(node.outputs[0].type).toBe(ConnectorType.Text);
  });
});

describe('createNode - Assistant 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Assistant, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 500 });
  });

  it('5개의 입력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.Assistant, 'id', { x: 0, y: 0 });
    expect(node.inputs).toHaveLength(5);
  });

  it('Text 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.Assistant, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Text);
  });
});

describe('createNode - Image 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Image, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 500 });
  });

  it('Image 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.Image, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Image);
  });
});

describe('createNode - ImageLoad 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.ImageLoad, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 300, height: 300 });
  });

  it('입력 커넥터가 없어야 한다', () => {
    const node = createNode(NodeType.ImageLoad, 'id', { x: 0, y: 0 });
    expect(node.inputs).toHaveLength(0);
  });

  it('Image 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.ImageLoad, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Image);
  });
});

describe('createNode - VideoLoad 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.VideoLoad, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 300, height: 300 });
  });

  it('Video 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.VideoLoad, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Video);
  });
});

describe('createNode - Camera 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Camera, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 380, height: 270 });
  });

  it('Text 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.Camera, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Text);
  });
});

describe('createNode - Preset 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Preset, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 350, height: 500 });
  });
});

describe('createNode - CameraPreset 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.CameraPreset, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 350, height: 480 });
  });
});

describe('createNode - Video 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Video, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 450, height: 500 });
  });

  it('Video 출력 커넥터를 포함해야 한다', () => {
    const node = createNode(NodeType.Video, 'id', { x: 0, y: 0 });
    const videoOut = node.outputs.find(o => o.type === ConnectorType.Video);
    expect(videoOut).toBeDefined();
  });
});

describe('createNode - VideoStitch 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.VideoStitch, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 500 });
  });

  it('2개의 Video 입력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.VideoStitch, 'id', { x: 0, y: 0 });
    expect(node.inputs).toHaveLength(2);
    expect(node.inputs[0].type).toBe(ConnectorType.Video);
    expect(node.inputs[1].type).toBe(ConnectorType.Video);
  });
});

describe('createNode - Model 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Model, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 550, height: 700 });
  });
});

describe('createNode - Vton 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Vton, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 900, height: 700 });
  });
});

describe('createNode - Comment 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Comment, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 250, height: 150 });
  });

  it('입출력 커넥터가 없어야 한다', () => {
    const node = createNode(NodeType.Comment, 'id', { x: 0, y: 0 });
    expect(node.inputs).toHaveLength(0);
    expect(node.outputs).toHaveLength(0);
  });
});

describe('createNode - Array 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Array, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 300, height: 300 });
  });

  it('Array 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.Array, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Array);
  });
});

describe('createNode - List 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.List, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 200, height: 150 });
  });

  it('Array 입력과 Text 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.List, 'id', { x: 0, y: 0 });
    expect(node.inputs[0].type).toBe(ConnectorType.Array);
    expect(node.outputs[0].type).toBe(ConnectorType.Text);
  });
});

describe('createNode - PromptConcatenator 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.PromptConcatenator, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 300, height: 250 });
  });
});

describe('createNode - Storyboard 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Storyboard, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 750, height: 1100 });
  });

  it('5개의 Image 출력과 5개의 Text 출력을 가져야 한다', () => {
    const node = createNode(NodeType.Storyboard, 'id', { x: 0, y: 0 });
    const imageOuts = node.outputs.filter(o => o.type === ConnectorType.Image);
    const textOuts = node.outputs.filter(o => o.type === ConnectorType.Text);
    expect(imageOuts).toHaveLength(5);
    expect(textOuts).toHaveLength(5);
  });
});

describe('createNode - Script 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Script, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 800, height: 1200 });
  });
});

describe('createNode - Composite 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Composite, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 500 });
  });
});

describe('createNode - Stitch 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Stitch, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 500 });
  });
});

describe('createNode - RMBG 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.RMBG, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 400 });
  });
});

describe('createNode - Group 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.Group, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 500, height: 400 });
  });

  it('입출력 커넥터가 없어야 한다', () => {
    const node = createNode(NodeType.Group, 'id', { x: 0, y: 0 });
    expect(node.inputs).toHaveLength(0);
    expect(node.outputs).toHaveLength(0);
  });
});

describe('createNode - GridShot 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.GridShot, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 450, height: 600 });
  });
});

describe('createNode - GridExtractor 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.GridExtractor, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 450, height: 650 });
  });

  it('Array 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.GridExtractor, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Array);
  });
});

describe('createNode - SelectImage 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.SelectImage, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 300, height: 350 });
  });

  it('Array 입력과 Image 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.SelectImage, 'id', { x: 0, y: 0 });
    expect(node.inputs[0].type).toBe(ConnectorType.Array);
    expect(node.outputs[0].type).toBe(ConnectorType.Image);
  });
});

describe('createNode - ImageModify 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.ImageModify, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 600, height: 750 });
  });
});

describe('createNode - OutfitDetail 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.OutfitDetail, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 600, height: 450 });
  });

  it('Text 출력 커넥터를 가져야 한다', () => {
    const node = createNode(NodeType.OutfitDetail, 'id', { x: 0, y: 0 });
    expect(node.outputs[0].type).toBe(ConnectorType.Text);
  });
});

describe('createNode - ImageEdit 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.ImageEdit, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 500 });
  });
});

describe('createNode - ImagePreview 노드', () => {
  it('올바른 크기를 가져야 한다', () => {
    const node = createNode(NodeType.ImagePreview, 'id', { x: 0, y: 0 });
    expect(node.size).toEqual({ width: 400, height: 500 });
  });
});

describe('createNode - 28개 NodeType 전체 검증', () => {
  const allNodeTypes = Object.values(NodeType);

  it('29개의 NodeType이 정의되어 있어야 한다', () => {
    expect(allNodeTypes).toHaveLength(29);
  });

  allNodeTypes.forEach((type) => {
    it(`${type} 노드를 오류 없이 생성할 수 있어야 한다`, () => {
      expect(() => createNode(type, `test-${type}`, { x: 0, y: 0 })).not.toThrow();
    });
  });

  allNodeTypes.forEach((type) => {
    it(`${type} 노드의 isBypassed는 false여야 한다`, () => {
      const node = createNode(type, `test-${type}`, { x: 0, y: 0 });
      expect(node.isBypassed).toBe(false);
    });
  });

  allNodeTypes.forEach((type) => {
    it(`${type} 노드의 isCollapsed는 false여야 한다`, () => {
      const node = createNode(type, `test-${type}`, { x: 0, y: 0 });
      expect(node.isCollapsed).toBe(false);
    });
  });
});
