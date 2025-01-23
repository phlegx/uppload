const n=(e,t,o)=>{try{return new File([e],t||"file_name",{lastModified:(o||new Date).getTime(),type:e.type})}catch{return e}},s=(e,t,o,r)=>({name:t,blob:e,lastModified:r,type:o}),l=e=>{const t=e.blob;return e.lastModified=e.lastModified||new Date,n(t,e.name,e.lastModified)};export{s as blobToUpploadFile,l as safeUpploadFileToFile};
//# sourceMappingURL=files.js.map
