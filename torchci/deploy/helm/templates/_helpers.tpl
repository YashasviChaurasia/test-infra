{{- define "dashboard.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dashboard.labels" -}}
app: {{ include "dashboard.fullname" . }}
app.kubernetes.io/name: {{ include "dashboard.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
