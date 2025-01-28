const c=t=>t.replace(/\n/g,"").replace(/ {2}/g,""),i=(t,o=2,n=!1)=>{if(t===0)return"0 Bytes";const e=n?1e3:1024,B=o<0?0:o,a=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],s=Math.floor(Math.log(t)/Math.log(e)),r=a[s];return parseFloat((t/Math.pow(e,s)).toFixed(B))+" "+r};export{i as formatBytes,c as minifyHTML};
//# sourceMappingURL=utils.js.map
