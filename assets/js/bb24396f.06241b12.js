"use strict";(self.webpackChunkviethungle_0503=self.webpackChunkviethungle_0503||[]).push([[9350],{7772:(e,i,s)=>{s.r(i),s.d(i,{assets:()=>a,contentTitle:()=>c,default:()=>d,frontMatter:()=>o,metadata:()=>t,toc:()=>l});const t=JSON.parse('{"id":"tutorials/sparse-checkout","title":"Sparse Checkout in Git","description":"Sparse checkout is a Git feature that allows you to check out only specific directories or files from a repository. This is particularly useful when working with large repositories where you only need a small portion of the codebase.","source":"@site/docs/tutorials/sparse-checkout.md","sourceDirName":"tutorials","slug":"/tutorials/sparse-checkout","permalink":"/viethungle/docs/tutorials/sparse-checkout","draft":false,"unlisted":false,"editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/tutorials/sparse-checkout.md","tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1},"sidebar":"tutorialSidebar","previous":{"title":"ARK: Survival Evolved Cheats","permalink":"/viethungle/docs/gaming/ark-cheats"},"next":{"title":"Cleaning Up Git Branches","permalink":"/viethungle/docs/tutorials/cleanup-git-branches"}}');var r=s(4848),n=s(8453);const o={sidebar_position:1},c="Sparse Checkout in Git",a={},l=[{value:"Use Cases",id:"use-cases",level:2},{value:"How to Use Sparse Checkout",id:"how-to-use-sparse-checkout",level:2},{value:"1. Create a Directory for the Repository",id:"1-create-a-directory-for-the-repository",level:3},{value:"2. Initialize a Git Repository",id:"2-initialize-a-git-repository",level:3},{value:"3. Add the Remote Repository",id:"3-add-the-remote-repository",level:3},{value:"4. Configure Sparse Checkout",id:"4-configure-sparse-checkout",level:3},{value:"5. Specify the Directory You Want",id:"5-specify-the-directory-you-want",level:3},{value:"6. Pull the Content",id:"6-pull-the-content",level:3},{value:"Real-World Example",id:"real-world-example",level:2},{value:"Tips and Tricks",id:"tips-and-tricks",level:2},{value:"Limitations",id:"limitations",level:2},{value:"Conclusion",id:"conclusion",level:2}];function h(e){const i={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,n.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(i.header,{children:(0,r.jsx)(i.h1,{id:"sparse-checkout-in-git",children:"Sparse Checkout in Git"})}),"\n",(0,r.jsx)(i.p,{children:"Sparse checkout is a Git feature that allows you to check out only specific directories or files from a repository. This is particularly useful when working with large repositories where you only need a small portion of the codebase."}),"\n",(0,r.jsx)(i.h2,{id:"use-cases",children:"Use Cases"}),"\n",(0,r.jsxs)(i.ul,{children:["\n",(0,r.jsx)(i.li,{children:"Working with monorepos where you only need specific components"}),"\n",(0,r.jsx)(i.li,{children:"Reducing disk space usage"}),"\n",(0,r.jsx)(i.li,{children:"Improving clone and checkout performance"}),"\n",(0,r.jsx)(i.li,{children:"Focusing on specific parts of a large codebase"}),"\n"]}),"\n",(0,r.jsx)(i.h2,{id:"how-to-use-sparse-checkout",children:"How to Use Sparse Checkout"}),"\n",(0,r.jsx)(i.p,{children:"Here's a step-by-step guide to using sparse checkout:"}),"\n",(0,r.jsx)(i.h3,{id:"1-create-a-directory-for-the-repository",children:"1. Create a Directory for the Repository"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:"mkdir my-repo\ncd my-repo\n"})}),"\n",(0,r.jsx)(i.h3,{id:"2-initialize-a-git-repository",children:"2. Initialize a Git Repository"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:"git init\n"})}),"\n",(0,r.jsx)(i.h3,{id:"3-add-the-remote-repository",children:"3. Add the Remote Repository"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:"git remote add origin https://github.com/username/repository.git\n"})}),"\n",(0,r.jsx)(i.h3,{id:"4-configure-sparse-checkout",children:"4. Configure Sparse Checkout"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:"git config core.sparseCheckout true\n"})}),"\n",(0,r.jsx)(i.h3,{id:"5-specify-the-directory-you-want",children:"5. Specify the Directory You Want"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:'echo "path/to/desired/directory/" > .git/info/sparse-checkout\n'})}),"\n",(0,r.jsx)(i.h3,{id:"6-pull-the-content",children:"6. Pull the Content"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:"git pull origin main\n"})}),"\n",(0,r.jsx)(i.h2,{id:"real-world-example",children:"Real-World Example"}),"\n",(0,r.jsx)(i.p,{children:"Here's a practical example using the shadcn-ui repository:"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:'# Create a directory for the repo\nmkdir shadcn-forms\ncd shadcn-forms\n\n# Initialize a git repository\ngit init\n\n# Add the remote\ngit remote add origin https://github.com/shadcn-ui/ui.git\n\n# Configure sparse checkout\ngit config core.sparseCheckout true\n\n# Specify the directory you want\necho "apps/www/app/(app)/examples/forms/" > .git/info/sparse-checkout\n\n# Pull the content\ngit pull origin main\n'})}),"\n",(0,r.jsx)(i.h2,{id:"tips-and-tricks",children:"Tips and Tricks"}),"\n",(0,r.jsxs)(i.ol,{children:["\n",(0,r.jsxs)(i.li,{children:["\n",(0,r.jsx)(i.p,{children:"You can specify multiple directories by adding multiple lines to the sparse-checkout file:"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:'echo "dir1/" >> .git/info/sparse-checkout\necho "dir2/" >> .git/info/sparse-checkout\n'})}),"\n"]}),"\n",(0,r.jsxs)(i.li,{children:["\n",(0,r.jsx)(i.p,{children:"To update the sparse-checkout configuration:"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:"git read-tree -mu HEAD\n"})}),"\n"]}),"\n",(0,r.jsxs)(i.li,{children:["\n",(0,r.jsx)(i.p,{children:"To disable sparse checkout:"}),"\n",(0,r.jsx)(i.pre,{children:(0,r.jsx)(i.code,{className:"language-bash",children:"git config core.sparseCheckout false\ngit read-tree -mu HEAD\n"})}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(i.h2,{id:"limitations",children:"Limitations"}),"\n",(0,r.jsxs)(i.ul,{children:["\n",(0,r.jsx)(i.li,{children:"Sparse checkout works best with shallow clones"}),"\n",(0,r.jsx)(i.li,{children:"Some Git operations might not work as expected with sparse checkout"}),"\n",(0,r.jsx)(i.li,{children:"You need to be careful with merges and pulls to avoid conflicts"}),"\n"]}),"\n",(0,r.jsx)(i.h2,{id:"conclusion",children:"Conclusion"}),"\n",(0,r.jsx)(i.p,{children:"Sparse checkout is a powerful feature that can help you work more efficiently with large repositories. By checking out only the parts you need, you can save disk space and improve performance."})]})}function d(e={}){const{wrapper:i}={...(0,n.R)(),...e.components};return i?(0,r.jsx)(i,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},8453:(e,i,s)=>{s.d(i,{R:()=>o,x:()=>c});var t=s(6540);const r={},n=t.createContext(r);function o(e){const i=t.useContext(n);return t.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function c(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),t.createElement(n.Provider,{value:i},e.children)}}}]);