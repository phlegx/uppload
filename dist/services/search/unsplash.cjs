"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const l=require("../../helpers/search.cjs");require("../../service.cjs");require("../../helpers/http.cjs");require("../../helpers/elements.cjs");require("../../helpers/assets.cjs");require("../../helpers/files.cjs");class t extends l.SearchBaseClass{constructor(s){super({apiKey:s,name:"unsplash",icon:'<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M81 113v72h94v-72h81v143H0V113h81zM175 0v71H81V0h94z" fill="#000" fill-rule="evenodd"/></svg>',color:"#333",poweredByUrl:"https://unsplash.com",popularEndpoint:e=>`https://api.unsplash.com/photos?client_id=${e}`,searchEndpoint:(e,r)=>`https://api.unsplash.com/search/photos?client_id=${e}&page=1&query=${encodeURIComponent(r)}`,getButton:e=>`<div class="result">
        <button aria-label="${e.alt_description||e.description}" data-full-url="${e.urls.regular}" style="background-image: url('${e.urls.thumb}')"></button>
        <small class="author">
          <img alt="" src="${e.user.profile_image.small}">
          <span>${e.user.name}</span>
        </small>
      </div>`,getSearchResults:e=>e.results,getPopularResults:e=>e})}}exports.default=t;
//# sourceMappingURL=unsplash.cjs.map
