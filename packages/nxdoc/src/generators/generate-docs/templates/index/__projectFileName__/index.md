<% if(frontMatter) {%>---
<% if(frontMatter.title) { %>title: "<%= frontMatter.title %>"<%}%>
sidebar_position: 0
sidebar_label: "Getting Started"
slug: /<%=projectFileName%>/
<%}%>---

<%if (gettingStartedMd && gettingStartedMd.length) {%># Getting Started
<%-gettingStartedMd%>
<%}%>

# API Reference

<% if(Object.values(generators).length > 0) {%>

## Generators

<% Object.entries(generators).forEach(([key, config]) => { %>

### [<%= key %>](./Generators/<%=key%>.md)

<%= config.description %>
<% })} %><% if(Object.values(executors).length > 0) {%>

## Executors

<% Object.entries(executors).forEach(([key, config]) => { %>

### [<%= key %>](./Executors/<%=key%>.md)

<%= config.description %>
<% })} %>
