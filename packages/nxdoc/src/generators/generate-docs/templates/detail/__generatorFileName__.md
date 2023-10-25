# <%= `${packageName}:${generatorName}` %>

<%if(schema.title){%>

## <%= schema.title %><%}%>

<%=schema.description%>

<% if(Object.values(schema.properties).length > 0) {%>

## Options <% Object.entries(schema.properties).forEach(([property, config]) => {

if (config.hidden) return;  
%>

### <%- (schema.required?.includes?.(property)) ? `<span className="required">${property}</span>` : property %>

<% if (!config.oneOf) { %>- (<%=config.type%>): <%= config.description %>
<%} else { config.oneOf.forEach(x => {%>

- (<%= x.type %>): <%=x.description%>
  <% })}})} %>
