import {
  Approval as ApprovalEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  TestnetERC20,
  Transfer as TransferEvent
} from "../generated/TestnetERC20/TestnetERC20"
import { Approval, OwnershipTransferred, Transfer } from "../generated/schema"
import { loadOrCreateUser } from "./utils"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  const sender = loadOrCreateUser(event.params.from.toHex())
  const reciever = loadOrCreateUser(event.params.to.toHex())
  const contract = TestnetERC20.bind(event.address)

  const senderBalance = contract.try_balanceOf(event.params.from)
  if(!senderBalance.reverted) {
    sender.balance = senderBalance.value
    sender.save()
  }
  
  const recieverBalance = contract.try_balanceOf(event.params.to)
  if(!recieverBalance.reverted) {
    reciever.balance = recieverBalance.value
    reciever.save()
  }
  entity.save()
}
