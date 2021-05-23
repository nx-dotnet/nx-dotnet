<% if(frontMatter) {%>---
<% if(frontMatter.title) { %>title: "<%= frontMatter.title %>"<%}%>
sidebar_position: 0
slug: /<%=projectFileName%>/
<%}%>---

# Getting Started

# API Reference

<% if(Object.values(generators).length > 0) {%>

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
