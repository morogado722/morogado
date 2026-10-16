/* Public distribution hints supplement metadata without changing observed facts or user URLs. */
(() => {
  function supplement(value){
    const font=typeof value==='string'?{name:value}:value;
    if(!font||typeof font!=='object')return value;
    const known=window.MorogadoExhibitionRecommendations?.fontDetails({name:font.name});
    if(!known?.catalogSourceURL)return font;
    const source=known.catalogSourceURL;
    const url=font.downloadUrl||(!font.downloadEdited&&!font.corrected?known.downloadUrl:'')||'';
    return {...font,catalogSourceURL:source,catalogWeights:known.catalogWeights,
      downloadUrl:url,downloadUrlKnown:Boolean(url&&url===source&&!font.downloadEdited&&!font.corrected),catalogBasis:'공식 배포 자료 · 실제 사용 굵기와 별도'};
  }
  window.MorogadoFontCatalog=Object.freeze({supplement});
})();
