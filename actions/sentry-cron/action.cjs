module.exports = async ({ inputs, actionPath }) => {
  const { checkIn } = await import(`${actionPath}/src/sentryCheckin.js`)
  await checkIn(inputs)
}
