# <%= project.name %>

<% if(Object.values(executors).length > 0) {%>

## Generators

<% Object.entries(generators).forEach(([key, config]) => { %>

### [<%= key %>](./generators/<%=key%>.md)

<%= config.description %>
<% })} %><% if(Object.values(executors).length > 0) {%>

## Executors

<% Object.entries(executors).forEach(([key, config]) => { %>

### [<%= key %>](./executors/<%=key%>.md)

<%= config.description %>
<% })} %>
