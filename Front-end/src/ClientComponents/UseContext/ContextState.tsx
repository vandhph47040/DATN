import { CombosProvider } from "./CombosContext";
import { FilmsProvider } from "./FIlmContext";
import { FinalPriceProvider } from "./FinalPriceContext";
import { SeatsProvider } from "./SeatsContext";
import { StepsProvider } from "./StepsContext";
import { AuthProvider } from "./TokenContext";
import { PromotionProvider } from "./PromotionContext";
import { InfomationProvider } from "./InfomationContext";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <FilmsProvider>
                <SeatsProvider>
                    <CombosProvider>
                        <StepsProvider>
                            <PromotionProvider>
                                <InfomationProvider>
                                    <FinalPriceProvider>
                                        {children}
                                    </FinalPriceProvider>
                                </InfomationProvider>
                            </PromotionProvider>
                        </StepsProvider>
                    </CombosProvider>
                </SeatsProvider>
            </FilmsProvider>
        </AuthProvider>
    );
};
