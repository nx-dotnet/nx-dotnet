# <%= project.name %>

## Generators
<% Object.entries(generators).forEach(([key, config]) => { %>
### <%= key %> 
<%= config.description %>
<% }) %>

## Executors
<% Object.entries(executors).forEach(([key, config]) => { %>
### <%= key %> 
<%= config.description %>
<% }) %>