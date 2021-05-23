# <%= `${packageName}:${generatorName}` %>

<%if(schema.title){%>

## <%= schema.title %><%}%>

<% if(Object.values(schema.properties).length > 0) {%>

## Options <% Object.entries(schema.properties).forEach(([property, config]) => {%>

### <%= property%> <% if (!config.anyOf) { %>(<%=config.type%>)

<%= config.description %> <%} else { config.anyOf.forEach(x => {%>

- (<%= x.type %>): <%=x.description%>
  <% })}})} %>
