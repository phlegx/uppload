const a=t=>t.replace(/\n/g,"").replace(/  /g,""),c=(t,o=2)=>{if(t===0)return"0 Bytes";const e=1024,s=o<0?0:o,B=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],n=Math.floor(Math.log(t)/Math.log(e)),r=B[n];return parseFloat((t/Math.pow(e,n)).toFixed(s))+" "+r};export{c as formatBytes,a as minifyHTML};
//# sourceMappingURL=utils.js.map
