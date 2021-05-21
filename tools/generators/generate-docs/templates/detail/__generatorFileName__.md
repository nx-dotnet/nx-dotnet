# <%= generatorName %>

<%if(schema.title){%>

## <%= schema.title %><%}%>

<% if(Object.values(schema.properties).length > 0) {%>

## Options <% Object.entries(schema.properties).forEach(([property, config]) => {%>

### <%= property%> (<%=config.type%>)

<%= config.description %>
<% })} %>
