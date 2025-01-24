import{SearchBaseClass as r}from"../../helpers/search.js";import"../../service.js";import"../../helpers/http.js";import"../../helpers/elements.js";import"../../helpers/assets.js";import"../../helpers/files.js";class h extends r{constructor(t){super({apiKey:t,name:"unsplash",icon:'<svg aria-hidden="true" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M81 113v72h94v-72h81v143H0V113h81zM175 0v71H81V0h94z" fill="#000" fill-rule="evenodd"/></svg>',color:"#333",poweredByUrl:"https://unsplash.com",popularEndpoint:s=>`https://api.unsplash.com/photos?client_id=${s}`,searchEndpoint:(s,l)=>`https://api.unsplash.com/search/photos?client_id=${s}&page=1&query=${encodeURIComponent(l)}`,getButton:s=>`<div class="result">
        <button type="button" aria-label="${s.alt_description||s.description}" data-full-url="${s.urls.regular}" style="background-image: url('${s.urls.thumb}')"></button>
        <small class="author">
          <img alt="" src="${s.user.profile_image.small}">
          <span>${s.user.name}</span>
        </small>
      </div>`,getSearchResults:s=>s.results,getPopularResults:s=>s})}}export{h as default};
//# sourceMappingURL=unsplash.js.map
