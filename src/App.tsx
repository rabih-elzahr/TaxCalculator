import { Flex, Text, Input, Stack, Button } from "@chakra-ui/react"

function App() {

  return (
    <Flex height="100vh" width="100%" justifyContent="center">
      <Flex flexDir="column" alignContent="center" justify="center">
        <Text fontWeight="bold" fontSize={32} marginBottom={4}>Tax Calculator</Text>
        <Stack>
          <Input placeholder="Annual income" variant="outline" />
          <Input placeholder="Tax year" variant="outline" />
        </Stack>
        <Button marginTop="4" borderRadius="8px">Submit</Button>
      </Flex>
    </Flex>
  )
}

export default App
