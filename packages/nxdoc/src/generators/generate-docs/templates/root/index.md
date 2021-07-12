<% if(includeFrontMatter) {%>---
sidebar_position: 0
slug: /
---<%}%>

# Our Plugins

<% packageDetails.forEach(pkg => {%>

## [<%= pkg.packageName %>](./<%=pkg.projectFileName%>)

<%if (pkg.executors > 0 ) {%>- <%= pkg.executors %> Executor<%= pkg.executors > 1 ? 's' : '' %> <%}%>
<%if (pkg.generators > 0 ) {%>- <%= pkg.generators %> Generator<%= pkg.generators > 1 ? 's' : '' %> <%}%>
<%})%>
