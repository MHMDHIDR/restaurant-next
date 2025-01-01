import React from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AddressInput({ onAddressChange }: { onAddressChange: (address: string) => void }) {
  const [address, setAddress] = React.useState({
    line1: "",
    area: "",
    postcode: "",
  })

  const londonAreas = [
    "Barking and Dagenham",
    "Barnet",
    "Bexley",
    "Brent",
    "Bromley",
    "Camden",
    "City of London",
    "Croydon",
    "Ealing",
    "Enfield",
    "Greenwich",
    "Hackney",
    "Hammersmith and Fulham",
    "Haringey",
    "Harrow",
    "Havering",
    "Hillingdon",
    "Hounslow",
    "Islington",
    "Kensington and Chelsea",
    "Kingston upon Thames",
    "Lambeth",
    "Lewisham",
    "Merton",
    "Newham",
    "Redbridge",
    "Richmond upon Thames",
    "Southwark",
    "Sutton",
    "Tower Hamlets",
    "Waltham Forest",
    "Wandsworth",
    "Westminster",
  ]

  const formatAddress = (addr: typeof address) => {
    const parts = [addr.line1, addr.area, addr.postcode.toUpperCase()].filter(Boolean)
    return parts.join(", ")
  }

  const handleChange = (field: string, value: string) => {
    const newAddress = { ...address, [field]: value }
    setAddress(newAddress)
    onAddressChange(formatAddress(newAddress))
  }

  const handlePostcodeInput = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^\dA-Z]/g, "")
    handleChange("postcode", formatted)
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Street Address"
        value={address.line1}
        onChange={e => handleChange("line1", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select value={address.area} onValueChange={value => handleChange("area", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Area" />
          </SelectTrigger>
          <SelectContent>
            {londonAreas.map(area => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Postcode"
          value={address.postcode}
          onChange={e => handlePostcodeInput(e.target.value)}
          className="uppercase"
          maxLength={8}
        />
      </div>
    </div>
  )
}
