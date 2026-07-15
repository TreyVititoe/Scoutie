import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { api } from "@walter/api-client";
import type { Flight, FlightJourney, Hotel, ScoredEvent, Suggestion } from "@walter/shared";

import { colors } from "../../theme/colors";

/*
 * Native mirrors of apps/web/components/results/* so the four result
 * sections read the same on both surfaces: photo (or icon tile) up top,
 * chips over the image, info rows, then price beside an Add pill above
 * a hairline divider.
 */

function AddButton({ added, onPress }: { added: boolean; onPress: () => void }) {
  /* Plain style objects only: mixing className with a style function
   * dropped the class styles and left white-on-white buttons. */
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: added ? "#FFFFFF" : colors.accent,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <SymbolView
        name={added ? "checkmark" : "plus"}
        tintColor={added ? colors.accent : "white"}
        size={12}
        fallback={null}
      />
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: added ? colors.accent : "white",
        }}
      >
        {added ? "Added" : "Add to Trip"}
      </Text>
    </Pressable>
  );
}

function PriceBlock({ amount, caption }: { amount: string; caption: string }) {
  return (
    <View>
      <Text className="text-ink text-[20px] font-semibold">{amount}</Text>
      <Text className="text-ink-faint text-[10px] font-semibold uppercase tracking-widest">
        {caption}
      </Text>
    </View>
  );
}

function ImageChip({ label }: { label: string }) {
  return (
    <View
      className="absolute left-3 top-3 rounded-full px-2.5 py-1"
      style={{ backgroundColor: "rgba(20, 25, 38, 0.85)" }}
    >
      <Text className="text-white text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </Text>
    </View>
  );
}

function CardImage({
  uri,
  fallbackIcon,
  chip,
  height = 160,
}: {
  uri: string | null;
  fallbackIcon: string;
  chip?: string | null;
  height?: number;
}) {
  return (
    <View style={{ height, backgroundColor: colors.surface2 }}>
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          transition={200}
          style={{ width: "100%", height }}
        />
      ) : (
        <View className="w-full h-full items-center justify-center">
          <SymbolView
            name={fallbackIcon as never}
            tintColor={colors.textTertiary}
            size={34}
            fallback={null}
          />
        </View>
      )}
      {chip ? <ImageChip label={chip} /> : null}
    </View>
  );
}

function InfoRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-1.5 mt-1.5">
      <SymbolView
        name={icon as never}
        tintColor={colors.textTertiary}
        size={13}
        fallback={null}
      />
      <Text className="text-ink-faint text-[12px] flex-1" numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

/* The pick gets a reason in Walter's voice, grounded in the data. */
function CuratorNote({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-ink-soft text-[13px] leading-5 mt-1.5">{children}</Text>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-card rounded-2xl overflow-hidden border border-line mb-3">
      {children}
    </View>
  );
}

function CardFooter({
  amount,
  caption,
  added,
  onToggle,
}: {
  amount: string;
  caption: string;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-line">
      <PriceBlock amount={amount} caption={caption} />
      <AddButton added={added} onPress={onToggle} />
    </View>
  );
}

/* ── Flights ── */

function stopsLabel(stops: number) {
  return stops === 0 ? "Nonstop" : `${stops} stop${stops === 1 ? "" : "s"}`;
}

function JourneyRow({ label, journey }: { label: string; journey: FlightJourney }) {
  return (
    <View className="mt-4">
      <Text className="text-ink-faint text-[10px] font-semibold uppercase tracking-widest mb-1.5">
        {label}
      </Text>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-ink text-[17px] font-semibold">
            {journey.departTime}
          </Text>
          <Text className="text-ink-faint text-[12px] mt-0.5" numberOfLines={1}>
            {journey.departure}
          </Text>
        </View>
        <View className="items-center flex-1 px-3">
          <Text className="text-ink-faint text-[11px]">{journey.duration}</Text>
          <View
            className="w-full h-px my-1.5"
            style={{ backgroundColor: colors.hairlineStrong }}
          />
          <Text
            className="text-[11px] font-medium"
            style={{
              color: journey.stops === 0 ? colors.accent : colors.textSecondary,
            }}
          >
            {stopsLabel(journey.stops)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-ink text-[17px] font-semibold">
            {journey.arriveTime}
          </Text>
          <Text className="text-ink-faint text-[12px] mt-0.5" numberOfLines={1}>
            {journey.arrival}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function FlightCard({
  flight,
  cheapest,
  added,
  onToggle,
}: {
  flight: Flight;
  cheapest?: boolean;
  added: boolean;
  onToggle: () => void;
}) {
  const outbound = flight.outbound;
  const ret = flight.return;
  const totalStops = outbound.stops + (ret?.stops ?? 0);
  return (
    <CardShell>
      <View className="p-4">
        <View className="flex-row items-center gap-2.5">
          <View
            className="w-9 h-9 rounded-full items-center justify-center overflow-hidden"
            style={{ backgroundColor: colors.surface2 }}
          >
            {flight.airlineLogo ? (
              <Image
                source={{ uri: flight.airlineLogo }}
                contentFit="contain"
                style={{ width: 20, height: 20 }}
              />
            ) : (
              <SymbolView
                name="airplane"
                tintColor={colors.accent}
                size={16}
                fallback={null}
              />
            )}
          </View>
          <Text className="text-ink text-[14px] font-semibold flex-1" numberOfLines={1}>
            {flight.airline}
          </Text>
          {cheapest ? (
            <View
              className="rounded-full px-2.5 py-0.5 border"
              style={{ backgroundColor: colors.surface2, borderColor: colors.hairline }}
            >
              <Text className="text-ink text-[10px] font-semibold uppercase tracking-wide">
                Walter's pick
              </Text>
            </View>
          ) : null}
        </View>

        {cheapest ? (
          <CuratorNote>
            {totalStops === 0
              ? `Nonstop, ${outbound.duration} in the air, and the lowest fare on this search. This is the one.`
              : `The lowest fare on this search. ${stopsLabel(totalStops)} total, but the hours are decent.`}
          </CuratorNote>
        ) : null}

        <JourneyRow label="Outbound" journey={outbound} />
        {ret ? <JourneyRow label="Return" journey={ret} /> : null}

        <CardFooter
          amount={`$${flight.price.toLocaleString()}`}
          caption={ret ? "Roundtrip total" : "One way"}
          added={added}
          onToggle={onToggle}
        />
      </View>
    </CardShell>
  );
}

/* ── Stays ── */

function ArrowButton({
  dir,
  onPress,
}: {
  dir: "left" | "right";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        position: "absolute",
        [dir]: 8,
        top: "50%",
        marginTop: -16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(252, 252, 254, 0.92)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.shadow,
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <SymbolView
        name={dir === "left" ? "chevron.left" : "chevron.right"}
        tintColor={colors.text}
        size={14}
        fallback={null}
      />
    </Pressable>
  );
}

export function HotelCard({
  hotel,
  bestValue,
  added,
  onToggle,
}: {
  hotel: Hotel;
  bestValue?: boolean;
  added: boolean;
  onToggle: () => void;
}) {
  const basePhotos =
    hotel.images && hotel.images.length > 0
      ? hotel.images
      : hotel.image
        ? [hotel.image]
        : [];
  const [photos, setPhotos] = useState<string[]>(basePhotos);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fetchedMore, setFetchedMore] = useState(false);
  /* Full photo set loads on the first arrow press. */
  const step = (dir: number) => {
    if (!fetchedMore && hotel.hotelId) {
      setFetchedMore(true);
      api.hotels
        .photos(hotel.hotelId)
        .then(({ photos: more }) => {
          if (more.length > 0) setPhotos((prev) => [...new Set([...prev, ...more])]);
        })
        .catch(() => {});
    }
    setPhotos((prev) => {
      setPhotoIndex((i) => (i + dir + prev.length) % prev.length);
      return prev;
    });
  };
  const height = bestValue ? 240 : 160;

  return (
    <CardShell>
      <View style={{ height, backgroundColor: colors.surface2 }}>
        {photos.length > 0 ? (
          <Image
            source={{ uri: photos[photoIndex] }}
            contentFit="cover"
            transition={150}
            style={{ width: "100%", height }}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <SymbolView
              name="bed.double.fill"
              tintColor={colors.textTertiary}
              size={34}
              fallback={null}
            />
          </View>
        )}
        {bestValue ? <ImageChip label="Walter's pick" /> : null}
        {photos.length > 1 || hotel.hotelId ? (
          <>
            <ArrowButton dir="left" onPress={() => step(-1)} />
            <ArrowButton dir="right" onPress={() => step(1)} />
            <View
              style={{
                position: "absolute",
                bottom: 8,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      i === photoIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>
      <View className="p-4">
        <Text className="text-ink text-[15px] font-semibold" numberOfLines={2}>
          {hotel.name}
        </Text>
        {hotel.address ? (
          <Text
            className="text-ink-faint text-[10px] font-semibold uppercase tracking-widest mt-1"
            numberOfLines={1}
          >
            {hotel.address}
          </Text>
        ) : null}
        {bestValue ? (
          <CuratorNote>
            {hotel.rating > 0 && hotel.reviewCount > 0
              ? `The math favors this one: ${hotel.rating}/10 from ${hotel.reviewCount.toLocaleString()} guests at $${hotel.pricePerNight} a night. We'd book it.`
              : "The best stay for the money on this search. We'd book it."}
          </CuratorNote>
        ) : null}
        {hotel.rating > 0 ? (
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <SymbolView
              name="star.fill"
              tintColor={colors.accent}
              size={13}
              fallback={null}
            />
            <Text className="text-ink text-[13px] font-semibold">
              {hotel.rating}/10
            </Text>
            {hotel.reviewCount > 0 ? (
              <Text className="text-ink-faint text-[12px]">
                ({hotel.reviewCount.toLocaleString()})
              </Text>
            ) : null}
          </View>
        ) : null}
        <CardFooter
          amount={`$${hotel.pricePerNight.toLocaleString()}`}
          caption={`per night · $${hotel.totalPrice.toLocaleString()} total`}
          added={added}
          onToggle={onToggle}
        />
      </View>
    </CardShell>
  );
}

/* ── Events ── */

function formatEventDate(dateStr: string): string {
  if (!dateStr) return "Date TBD";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function EventCard({
  event,
  featured = false,
  added,
  onToggle,
}: {
  event: ScoredEvent;
  featured?: boolean;
  added: boolean;
  onToggle: () => void;
}) {
  const time = formatEventTime(event.time);
  return (
    <CardShell>
      <CardImage
        uri={event.image}
        fallbackIcon="ticket.fill"
        chip={featured ? "This is why you're going" : event.category}
        height={featured ? 240 : 160}
      />
      <View className="p-4">
        <Text className="text-ink text-[15px] font-semibold" numberOfLines={2}>
          {event.name}
        </Text>
        {featured ? (
          <CuratorNote>
            The closest match to what you told Walter you love, during your dates.
          </CuratorNote>
        ) : null}
        <InfoRow icon="mappin">{event.venueName}</InfoRow>
        <InfoRow icon="calendar">
          {formatEventDate(event.date)}
          {time ? `  ·  ${time}` : ""}
        </InfoRow>
        <CardFooter
          amount={event.priceMin ? `$${event.priceMin.toLocaleString()}` : "See tickets"}
          caption={event.priceMin ? "per ticket" : "price varies"}
          added={added}
          onToggle={onToggle}
        />
      </View>
    </CardShell>
  );
}

/* ── Walter's picks ── */

const SUGGESTION_ICONS: Record<string, string> = {
  activity: "figure.hiking",
  restaurant: "fork.knife",
  site: "mappin.and.ellipse",
};

const SUGGESTION_LABELS: Record<string, string> = {
  activity: "Activity",
  restaurant: "Dining",
  site: "Landmark",
};

export function SuggestionCard({
  suggestion,
  added,
  onToggle,
}: {
  suggestion: Suggestion;
  added: boolean;
  onToggle: () => void;
}) {
  const hasCost = suggestion.estimatedCost != null && suggestion.estimatedCost > 0;
  return (
    <CardShell>
      <View className="p-4">
        <View className="flex-row items-center gap-2.5 mb-3">
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.surface2 }}
          >
            <SymbolView
              name={(SUGGESTION_ICONS[suggestion.type] ?? "sparkles") as never}
              tintColor={colors.accent}
              size={16}
              fallback={null}
            />
          </View>
          <Text className="text-ink-faint text-[11px] font-semibold uppercase tracking-widest">
            {SUGGESTION_LABELS[suggestion.type] ?? suggestion.type}
          </Text>
        </View>
        <Text className="text-ink text-[16px] font-semibold" numberOfLines={2}>
          {suggestion.title}
        </Text>
        <Text className="text-ink-soft text-[13px] leading-5 mt-1.5" numberOfLines={3}>
          {suggestion.description}
        </Text>
        <InfoRow icon="mappin">{suggestion.locationName}</InfoRow>
        <CardFooter
          amount={hasCost ? `$${suggestion.estimatedCost!.toLocaleString()}` : "Free or varies"}
          caption={hasCost ? "estimated" : suggestion.bestTime || "anytime"}
          added={added}
          onToggle={onToggle}
        />
      </View>
    </CardShell>
  );
}
