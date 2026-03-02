package api

import (
	"admin/api/auth"

	"github.com/gin-gonic/gin"
)

// InitRouter 设置路由
// 返回值: Gin路由引擎
func InitRouter() *gin.Engine {
	r := gin.Default()

	// 安全响应头（CSP 等）
	r.Use(securityHeaders())

	// 注册认证路由
	auth.RegisterAuthRoutes(r)
	
	// 注册文档路由
	auth.RegisterDocsRoutes(r)

	return r
}

// securityHeaders 设置基础安全响应头
func securityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Referrer-Policy", "no-referrer")
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		c.Next()
	}
}
