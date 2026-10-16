/* Exhibition home-card display samples. These values are not uploaded-file
 * metadata, verified software usage, or real visitor activity. Only explicit
 * example records receive display fields; storage and canonical fields stay intact. */
(() => {
  'use strict';
  const samples = {
  "example-1": {
    "tools": [
      "ai.",
      "ps."
    ],
    "tags": [
      "그래픽",
      "무늬",
      "용"
    ],
    "relay": 3,
    "comments": 18,
    "previewAsset": "img913Cecc934E9E2E424Da3C4F4E87Bacd1"
  },
  "example-2": {
    "tools": [
      "blend.",
      "ai."
    ],
    "tags": [
      "타이포",
      "포스터",
      "3D"
    ],
    "relay": 8,
    "comments": 27,
    "previewAsset": "img4E37Dd2151411A6A038A6443Ff45B8802"
  },
  "example-3": {
    "tools": [
      "blend.",
      "ps."
    ],
    "tags": [
      "3D",
      "금속",
      "조형"
    ],
    "relay": 2,
    "comments": 12,
    "previewAsset": "img87222Fa31A89E77217Ef5A4523680F1D3"
  },
  "example-4": {
    "tools": [
      "ai.",
      "ps."
    ],
    "tags": [
      "그래픽",
      "꽃",
      "색채"
    ],
    "relay": 6,
    "comments": 21,
    "previewAsset": "imgCce440D12Cb30168767843252A88Deba1"
  },
  "example-5": {
    "tools": [
      "blend.",
      "zbr."
    ],
    "tags": [
      "3D",
      "인체",
      "조형"
    ],
    "relay": 5,
    "comments": 38,
    "previewAsset": "imgX4Xkifqv2"
  },
  "example-6": {
    "tools": [
      "c4d.",
      "ps."
    ],
    "tags": [
      "3D",
      "꽃",
      "포스터"
    ],
    "relay": 11,
    "comments": 25,
    "previewAsset": "imgF6E10Fd5De18Ccc1Ee016Fabe26798D41"
  },
  "example-7": {
    "tools": [
      "blend.",
      "blend."
    ],
    "tags": [
      "3D",
      "3D",
      "3D",
      "3D"
    ],
    "relay": 1,
    "comments": 34,
    "previewAsset": "imgAb232F84031Cf918F5941B221Dba194971"
  },
  "example-8": {
    "tools": [
      "blend.",
      "rhino"
    ],
    "tags": [
      "3D",
      "제품",
      "로버"
    ],
    "relay": 9,
    "comments": 42,
    "previewAsset": "img5988472"
  },
  "example-9": {
    "tools": [
      "ai.",
      "ps."
    ],
    "tags": [
      "그래픽",
      "도형",
      "흑백"
    ],
    "relay": 4,
    "comments": 16,
    "previewAsset": "imgE5D794574A0A986A0Bef276F81F034A81"
  },
  "example-10": {
    "tools": [
      "ai.",
      "ps."
    ],
    "tags": [
      "그래픽",
      "색채",
      "포스터"
    ],
    "relay": 12,
    "comments": 31,
    "previewAsset": "imgA14F73Fa325C54E372D60790441D78943"
  },
  "example-11": {
    "tools": [
      "blend.",
      "rhino"
    ],
    "tags": [
      "3D",
      "제품",
      "바이크"
    ],
    "relay": 7,
    "comments": 46,
    "previewAsset": "img202609040422205"
  },
  "example-12": {
    "tools": [
      "ps.",
      "ai."
    ],
    "tags": [
      "그래픽",
      "초상",
      "패턴"
    ],
    "relay": 10,
    "comments": 19,
    "previewAsset": "img846F3E231093907C9C8001267Edc7Af63"
  },
  "example-13": {
    "tools": [
      "ai.",
      "id."
    ],
    "tags": [
      "그래픽",
      "사인",
      "타이포"
    ],
    "relay": 16,
    "comments": 29,
    "previewAsset": "img441C8Fa570A4Ed6125349B44Ab6E08633"
  },
  "example-14": {
    "tools": [
      "ai.",
      "id."
    ],
    "tags": [
      "그래픽",
      "전시",
      "포스터"
    ],
    "relay": 14,
    "comments": 37,
    "previewAsset": "img202512181154436"
  },
  "example-15": {
    "tools": [
      "skp.",
      "blend."
    ],
    "tags": [
      "3D",
      "공간",
      "가구"
    ],
    "relay": 13,
    "comments": 44,
    "previewAsset": "img202505191131261"
  },
  "example-16": {
    "tools": [
      "id.",
      "ai."
    ],
    "tags": [
      "타이포",
      "편집",
      "서체"
    ],
    "relay": 18,
    "comments": 23,
    "previewAsset": "img41"
  },
  "example-17": {
    "tools": [
      "rhino",
      "blend."
    ],
    "tags": [
      "3D",
      "제품",
      "안경"
    ],
    "relay": 15,
    "comments": 41,
    "previewAsset": "img202512181154431"
  },
  "example-18": {
    "tools": [
      "blend.",
      "ps."
    ],
    "tags": [
      "3D",
      "제품",
      "빛"
    ],
    "relay": 17,
    "comments": 26,
    "previewAsset": "img31"
  },
  "example-19": {
    "tools": [
      "id.",
      "ps."
    ],
    "tags": [
      "편집",
      "음반",
      "패키지"
    ],
    "relay": 20,
    "comments": 33,
    "previewAsset": "img01CdDigipackMockups1"
  },
  "example-20": {
    "tools": [
      "ae.",
      "ps."
    ],
    "tags": [
      "모션",
      "캐릭터",
      "드로잉"
    ],
    "relay": 19,
    "comments": 48,
    "previewAsset": "imgB3F6F885F736Cec743059Ef3C1Bb707B2"
  }
};
  function apply(examples) {
    if (!Array.isArray(examples)) return examples;
    for (const record of examples) {
      if (!record || record.example !== true) continue;
      const sample = Object.prototype.hasOwnProperty.call(samples, record.id) ? samples[record.id] : null;
      if (!sample) continue;
      record.displayTools = [...sample.tools];
      record.displayTags = [...sample.tags];
      record.displayStats = { relay: sample.relay, comments: sample.comments };
      record.displayProvenance = {
        sample: true,
        scope: 'exhibition-home-card-display',
        origin: record.id === 'example-7' ? 'figma-reference-display' : 'user-approved-illustrative-sample',
        previewSource: { node: '3423:5361', asset: sample.previewAsset },
        canonicalFieldsUnchanged: true,
        actualToolsVerified: false,
        actualActivityVerified: false,
        description: record.id === 'example-7'
          ? '피그마 탁상 조명 카드의 표시 예시를 보존한 값. 실제 사용 도구와 활동 기록으로 확인하지 않음.'
          : '사용자 승인에 따라 이미지 주제에 맞춰 만든 도구·태그·활동 수 표시 예시. 실제 파일 메타데이터와 사용자 활동이 아님.'
      };
    }
    return examples;
  }
  window.MorogadoHomeCardSamples = Object.freeze({ apply });
})();
