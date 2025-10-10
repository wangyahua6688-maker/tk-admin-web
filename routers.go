package api

import (
	"admin/api/auth"

	"github.com/gin-gonic/gin"
)

// InitRouter 设置路由
// 返回值: Gin路由引擎
func InitRouter() *gin.Engine {
	r := gin.Default()

	// 注册认证路由
	auth.RegisterAuthRoutes(r)
	
	// 注册文档路由
	auth.RegisterDocsRoutes(r)

	return r
}
