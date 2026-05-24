func GetContainerLogs(c *gin.Context) {

	name :=
		c.Param("name")

	cmd := exec.Command(
		"docker",
		"logs",
		"--tail",
		"50",
		name,
	)

	output, err := cmd.CombinedOutput()

	if err != nil {

		c.JSON(http.StatusInternalServerError,
			gin.H{
				"error": "Cannot fetch logs",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs": string(output),
	})
}